#!/usr/bin/env python3
"""Catálogo de serviços e funcionalidades da COGIT (vault do Obsidian).

Lê o frontmatter (propriedades) das notas de:
  03-Servicos/            tipo: servico
  04-Catalogo/Itens/      tipo: item   (cada variação ou funcionalidade, com o seu preço)
  04-Catalogo/Combos/     tipo: combo

e então:
  1. valida ids, serviços citados, preços e campos obrigatórios;
  2. atualiza os trechos gerados (entre <!-- catalogo:inicio --> e <!-- catalogo:fim -->)
     nas notas de serviço, nos itens, nos combos e no índice do catálogo;
  3. exporta _sistema/catalogo.json e _sistema/catalogo.csv
     (o JSON é o formato para a Jornada MVP / orçamento por funcionalidade).

Uso (a partir da pasta do vault):
  python3 _sistema/catalogo.py           valida, atualiza as notas e exporta
  python3 _sistema/catalogo.py --check   só confere; sai com 1 se houver erro ou algo desatualizado

Só biblioteca padrão, Python 3.9 ou mais novo.
"""
import csv
import io
import json
import math
import os
import re
import sys
from urllib.parse import quote

VAULT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PASTA_SERVICOS = '03-Servicos'
PASTA_ITENS = os.path.join('04-Catalogo', 'Itens')
PASTA_COMBOS = os.path.join('04-Catalogo', 'Combos')
INDICE_CATALOGO = os.path.join('04-Catalogo', 'INDEX.md')
INICIO, FIM = '<!-- catalogo:inicio -->', '<!-- catalogo:fim -->'

# Ordem de exibição. Uma categoria nova (escrita num item) entra no fim, sem quebrar nada.
CATEGORIAS = [
    'Domínio, hospedagem e e-mail', 'SEO', 'Métricas e rastreamento', 'Privacidade e LGPD',
    'Conteúdo e textos', 'Páginas e design', 'Componentes de página', 'Formulários e captação',
    'Loja virtual', 'Acesso e usuários', 'Dados e cadastros', 'Painéis e relatórios',
    'Comunicação e notificações', 'Pagamentos e cobrança', 'Módulos de negócio',
    'Área de membros e cursos', 'Inteligência artificial', 'Infraestrutura e plataforma',
    'Integrações', 'Automações', 'Identidade visual', 'Suporte e operação', 'Projeto e entrega',
]
TIPOS_PRECO = {'fixo', 'a-partir-de', 'por-unidade', 'recorrente', 'repasse', 'percentual', 'incluso', 'sob-consulta'}
STATUS = {'ativo', 'a-validar', 'pausado'}
FORMATOS = {'ambos', 'modelo-pronto', 'sob-medida'}


# ── leitura do frontmatter (subconjunto de YAML que o Obsidian grava) ──

def _escalar(v):
    v = v.strip()
    if v == '' or v in ('null', '~'):
        return None
    if (v[0] == v[-1]) and v[0] in '"\'' and len(v) >= 2:
        return v[1:-1]
    if v in ('true', 'false'):
        return v == 'true'
    if v.startswith('[') and v.endswith(']'):
        corpo = v[1:-1].strip()
        return [_escalar(p) for p in corpo.split(',')] if corpo else []
    if re.fullmatch(r'-?\d+', v):
        return int(v)
    if re.fullmatch(r'-?\d+\.\d+', v):
        return float(v)
    return v


def ler_frontmatter(texto):
    if not texto.startswith('---'):
        return {}, texto
    fim = re.search(r'^---\s*$', texto[3:], re.M)
    if not fim:
        return {}, texto
    bruto = texto[3:3 + fim.start()]
    corpo = texto[3 + fim.end():]
    try:
        import yaml  # usa o PyYAML se estiver instalado
        dados = yaml.safe_load(bruto) or {}
        return dados, corpo
    except ImportError:
        pass
    dados, chave = {}, None
    for linha in bruto.splitlines():
        if not linha.strip() or linha.lstrip().startswith('#'):
            continue
        m = re.match(r'^\s+-\s*(.*)$', linha)
        if m and chave is not None:
            if not isinstance(dados.get(chave), list):
                dados[chave] = []
            dados[chave].append(_escalar(m.group(1)))
            continue
        m = re.match(r'^([^:\s][^:]*):\s*(.*)$', linha)
        if m:
            chave = m.group(1).strip()
            dados[chave] = _escalar(m.group(2))
    return dados, corpo


def lista(v):
    if v is None:
        return []
    return v if isinstance(v, list) else [v]


def notas(pasta):
    base = os.path.join(VAULT, pasta)
    if not os.path.isdir(base):
        return []
    saida = []
    for nome in sorted(os.listdir(base)):
        if not nome.endswith('.md') or nome in ('INDEX.md', 'README.md'):
            continue
        caminho = os.path.join(base, nome)
        with open(caminho, encoding='utf-8') as f:
            texto = f.read()
        dados, _ = ler_frontmatter(texto)
        dados['_caminho'] = caminho
        dados['_titulo'] = nome[:-3]
        saida.append(dados)
    return saida


# ── formatação ──

def reais(n):
    if n is None:
        return '—'
    if float(n).is_integer():
        return 'R$ ' + f'{int(n):,}'.replace(',', '.')
    return 'R$ ' + f'{n:,.2f}'.replace(',', 'X').replace('.', ',').replace('X', '.')


def rotulo_preco(d):
    t, p, u = d.get('tipo_preco'), d.get('preco'), d.get('unidade') or 'projeto'
    por = '' if u == 'projeto' else f' / {u}'
    if t == 'incluso':
        return 'Incluso'
    if t == 'sob-consulta':
        return 'Sob consulta'
    if t == 'fixo' and p == 0:
        return 'Gratuito'
    if t == 'percentual':
        return f'{"+" if (p or 0) >= 0 else "−"}{abs(p or 0):g}% {u if u != "projeto" else "sobre o projeto"}'.strip()
    if t == 'repasse':
        return f'Repasse ≈ {reais(p)}{por}' if p else 'Repasse (conforme uso)'
    if t == 'a-partir-de':
        return f'a partir de {reais(p)}{por}'
    if t == 'recorrente':
        return f'{reais(p)}/{u}'
    return f'{reais(p)}{por}'


def link(de_arquivo, para_arquivo, texto):
    rel = os.path.relpath(para_arquivo, os.path.dirname(de_arquivo)).replace(os.sep, '/')
    return f'[{texto}]({quote(rel)})'


def ordem_categoria(c):
    return CATEGORIAS.index(c) if c in CATEGORIAS else len(CATEGORIAS)


def tabela_md(cabecalho, linhas):
    out = ['| ' + ' | '.join(cabecalho) + ' |', '|' + '---|' * len(cabecalho)]
    out += ['| ' + ' | '.join(str(c).replace('|', '\\|') for c in l) + ' |' for l in linhas]
    return out


def trocar_bloco(texto, conteudo):
    bloco = f'{INICIO}\n{conteudo.rstrip()}\n{FIM}'
    if INICIO in texto and FIM in texto:
        a = texto.index(INICIO)
        b = texto.index(FIM) + len(FIM)
        return texto[:a] + bloco + texto[b:]
    return texto.rstrip() + '\n\n' + bloco + '\n'


# ── validação ──

def validar(servicos, itens, combos):
    erros = []
    ids = {}
    for d in servicos + itens + combos:
        i = d.get('id')
        if not i:
            erros.append(f'{d["_titulo"]}: falta a propriedade id')
            continue
        if i in ids:
            erros.append(f'id repetido "{i}": {ids[i]} e {d["_titulo"]}')
        ids[i] = d['_titulo']
    ids_serv = {s.get('id') for s in servicos}
    for d in servicos + itens:
        if d.get('tipo_preco') not in TIPOS_PRECO:
            erros.append(f'{d["_titulo"]}: tipo_preco "{d.get("tipo_preco")}" (use {", ".join(sorted(TIPOS_PRECO))})')
        if d.get('status') not in STATUS:
            erros.append(f'{d["_titulo"]}: status "{d.get("status")}" (use {", ".join(sorted(STATUS))})')
        p = d.get('preco')
        if d.get('tipo_preco') not in ('incluso', 'sob-consulta') and not isinstance(p, (int, float)):
            erros.append(f'{d["_titulo"]}: preco precisa ser um número')
    for d in itens:
        if not d.get('categoria'):
            erros.append(f'{d["_titulo"]}: falta categoria')
        if d.get('formato', 'ambos') not in FORMATOS:
            erros.append(f'{d["_titulo"]}: formato "{d.get("formato")}" (use {", ".join(sorted(FORMATOS))})')
        for campo in ('servicos', 'incluso_em'):
            for s in lista(d.get(campo)):
                if s not in ids_serv:
                    erros.append(f'{d["_titulo"]}: {campo} cita o serviço "{s}", que não existe em 03-Servicos')
        if not lista(d.get('servicos')) and not lista(d.get('incluso_em')):
            erros.append(f'{d["_titulo"]}: não está ligado a nenhum serviço (servicos ou incluso_em)')
    for c in combos:
        for s in lista(c.get('servicos')):
            if s not in ids_serv:
                erros.append(f'{c["_titulo"]}: cita o serviço "{s}", que não existe')
    return erros


# ── blocos gerados ──

def preco_combo(c, por_id):
    total = 0
    for s in lista(c.get('servicos')):
        total += por_id[s].get('preco') or 0
    desconto = c.get('desconto') or 0
    final = math.floor(total * (100 - desconto) / 100 / 10) * 10  # para baixo, de 10 em 10
    return total, final


def bloco_servico(s, itens):
    sid = s['id']
    meus = [i for i in itens if sid in lista(i.get('servicos')) or sid in lista(i.get('incluso_em'))]
    if not meus:
        return '_Nenhuma variação cadastrada para este serviço ainda._'
    meus.sort(key=lambda i: (ordem_categoria(i.get('categoria')), sid not in lista(i.get('incluso_em')), i.get('nome') or i['_titulo']))
    out = [f'{len(meus)} variações e funcionalidades ligadas a este serviço. '
           f'"Incluso" já está no valor base; o resto soma ao orçamento.']
    cat_atual = None
    linhas = []

    def fechar():
        if linhas:
            out.extend(tabela_md(['Item', 'Preço', 'Formato', 'Horas', 'Status'], linhas))

    for i in meus:
        if i.get('categoria') != cat_atual:
            fechar()
            linhas = []
            cat_atual = i.get('categoria')
            out += ['', f'### {cat_atual}', '']
        preco = 'Incluso na base' if sid in lista(i.get('incluso_em')) else rotulo_preco(i)
        linhas.append([link(s['_caminho'], i['_caminho'], i.get('nome') or i['_titulo']), preco,
                       i.get('formato') or 'ambos', '' if i.get('horas') is None else f'{i["horas"]:g}', i.get('status')])
    fechar()
    return '\n'.join(out)


def bloco_item(i, por_id):
    partes = []
    for campo, rotulo in (('incluso_em', 'Incluso na base de'), ('servicos', 'Pode ser somado a')):
        alvos = [por_id[s] for s in lista(i.get(campo)) if s in por_id]
        if alvos:
            partes.append(f'**{rotulo}:** ' + ', '.join(link(i['_caminho'], a['_caminho'], a['_titulo']) for a in alvos))
    partes.append(f'**Preço:** {rotulo_preco(i)} · **Status:** {i.get("status")}')
    return '\n\n'.join(partes)


def bloco_combo(c, por_id):
    total, final = preco_combo(c, por_id)
    linhas = [[link(c['_caminho'], por_id[s]['_caminho'], por_id[s]['_titulo']), rotulo_preco(por_id[s])] for s in lista(c.get('servicos'))]
    out = tabela_md(['Serviço', 'Preço'], linhas)
    out += ['', f'**Soma:** {reais(total)} · **Desconto:** {c.get("desconto") or 0}% · **Valor da combinação:** {reais(final)}']
    return '\n'.join(out)


def bloco_indice(servicos, itens, combos, por_id):
    idx = os.path.join(VAULT, INDICE_CATALOGO)
    out = [f'**{len(itens)} itens** em {len({i.get("categoria") for i in itens})} categorias · '
           f'{sum(1 for i in itens if i.get("status") == "a-validar")} ainda a validar.', '']
    out += ['## Serviços (valor base)', '']
    out += tabela_md(['Serviço', 'Base', 'Sob medida', 'Status'],
                     [[link(idx, s['_caminho'], s['_titulo']), rotulo_preco(s),
                       reais(s['preco_sob_medida']) if s.get('preco_sob_medida') else '—', s.get('status')] for s in servicos])
    out += ['', '## Combinações', '']
    for c in combos:
        total, final = preco_combo(c, por_id)
        out.append(f'- {link(idx, c["_caminho"], c["_titulo"])}: {reais(total)} → {reais(final)} ({c.get("desconto")}% de desconto)')
    cats = sorted({i.get('categoria') for i in itens}, key=ordem_categoria)
    for cat in cats:
        out += ['', f'## {cat}', '']
        for i in sorted([i for i in itens if i.get('categoria') == cat], key=lambda i: i.get('nome') or i['_titulo']):
            onde = lista(i.get('servicos')) or lista(i.get('incluso_em'))
            out.append(f'- {link(idx, i["_caminho"], i.get("nome") or i["_titulo"])}: {rotulo_preco(i)} · {", ".join(onde)}')
    return '\n'.join(out)


# ── exportação ──

def limpo(d, campos):
    return {c: d.get(c) for c in campos}


def exportar(servicos, itens, combos, por_id):
    campos_s = ['id', 'nome', 'frente', 'tipo_preco', 'preco', 'preco_sob_medida', 'unidade', 'prazo', 'status']
    campos_i = ['id', 'nome', 'categoria', 'servicos', 'incluso_em', 'formato', 'tipo_preco', 'preco', 'unidade', 'horas', 'status', 'descricao']
    dados = {
        'moeda': 'BRL',
        'observacao': 'Gerado por _sistema/catalogo.py a partir das notas do vault. Não edite à mão.',
        'servicos': [dict(limpo(s, campos_s), nome=s.get('nome') or s['_titulo']) for s in servicos],
        'itens': [dict(limpo(i, campos_i), servicos=lista(i.get('servicos')), incluso_em=lista(i.get('incluso_em')),
                       nome=i.get('nome') or i['_titulo'], formato=i.get('formato') or 'ambos', preco_rotulo=rotulo_preco(i))
                  for i in itens],
        'combos': [dict(id=c['id'], nome=c['_titulo'], servicos=lista(c.get('servicos')), modelo=c.get('modelo'),
                        desconto=c.get('desconto'), preco_cheio=preco_combo(c, por_id)[0], preco_final=preco_combo(c, por_id)[1])
                   for c in combos],
    }
    js = json.dumps(dados, ensure_ascii=False, indent=2) + '\n'
    buf = io.StringIO()
    w = csv.writer(buf, lineterminator='\n')
    w.writerow(['id', 'nome', 'categoria', 'servicos', 'incluso_em', 'formato', 'tipo_preco', 'preco', 'unidade', 'horas', 'status', 'preco_rotulo'])
    for i in dados['itens']:
        w.writerow([i['id'], i['nome'], i['categoria'], ';'.join(i['servicos']), ';'.join(i['incluso_em']), i['formato'],
                    i['tipo_preco'], '' if i['preco'] is None else i['preco'], i['unidade'] or '',
                    '' if i['horas'] is None else i['horas'], i['status'], i['preco_rotulo']])
    return {os.path.join(VAULT, '_sistema', 'catalogo.json'): js, os.path.join(VAULT, '_sistema', 'catalogo.csv'): buf.getvalue()}


def main():
    so_conferir = '--check' in sys.argv
    servicos = notas(PASTA_SERVICOS)
    servicos = [s for s in servicos if s.get('tipo') == 'servico']
    servicos.sort(key=lambda s: (s.get('ordem') or 999, s['_titulo']))
    itens = [i for i in notas(PASTA_ITENS) if i.get('tipo') == 'item']
    itens.sort(key=lambda i: (ordem_categoria(i.get('categoria')), i.get('nome') or i['_titulo']))
    combos = [c for c in notas(PASTA_COMBOS) if c.get('tipo') == 'combo']

    erros = validar(servicos, itens, combos)
    if erros:
        print('Erros no catálogo:')
        for e in erros:
            print('  -', e)
        sys.exit(1)
    por_id = {s['id']: s for s in servicos}

    novos = {}

    def agendar(caminho, conteudo):
        with open(caminho, encoding='utf-8') as f:
            atual = f.read()
        novo = trocar_bloco(atual, conteudo)
        if novo != atual:
            novos[caminho] = novo

    for s in servicos:
        agendar(s['_caminho'], bloco_servico(s, itens))
    for i in itens:
        agendar(i['_caminho'], bloco_item(i, por_id))
    for c in combos:
        agendar(c['_caminho'], bloco_combo(c, por_id))
    agendar(os.path.join(VAULT, INDICE_CATALOGO), bloco_indice(servicos, itens, combos, por_id))
    for caminho, conteudo in exportar(servicos, itens, combos, por_id).items():
        atual = open(caminho, encoding='utf-8').read() if os.path.exists(caminho) else None
        if atual != conteudo:
            novos[caminho] = conteudo

    resumo = f'{len(servicos)} serviços, {len(itens)} itens, {len(combos)} combinações'
    if so_conferir:
        if novos:
            print(f'Desatualizado ({resumo}). Rode: python3 _sistema/catalogo.py')
            for c in novos:
                print('  -', os.path.relpath(c, VAULT))
            sys.exit(1)
        print(f'Catálogo em dia: {resumo}.')
        return
    for caminho, conteudo in novos.items():
        with open(caminho, 'w', encoding='utf-8') as f:
            f.write(conteudo)
    print(f'Catálogo atualizado: {resumo}. {len(novos)} arquivo(s) reescrito(s).')


if __name__ == '__main__':
    main()
