# Custo Certo Plus - Landing Page

Landing page de pitch e captura de leads para o Custo Certo Plus, uma ferramenta mobile-first para ajudar profissionais e clinicas de saude a entender custo por atendimento, margem, ponto de equilibrio e impacto de descontos/tabelas.

## Arquivos principais

- `index.html`: landing page principal com diagnostico financeiro e captura de lead.
- `venda.html`: pagina de conversao com planos sugeridos.
- `styles.css`: identidade visual, layout responsivo e componentes.
- `script.js`: calculadora do diagnostico, modal de lead e fluxo para pagina de venda.
- `assets/`: imagens extraidas do prototipo do app.

## Como visualizar localmente

Abra `index.html` diretamente no navegador ou rode um servidor estatico na pasta do projeto.

Exemplo:

```bash
python -m http.server 4173
```

Depois acesse:

```text
http://127.0.0.1:4173/index.html
```

## Publicacao no GitHub Pages

Depois de enviar estes arquivos para um repositorio no GitHub:

1. Abra `Settings`.
2. Entre em `Pages`.
3. Em `Build and deployment`, selecione `Deploy from a branch`.
4. Escolha a branch principal e a pasta `/root`.
5. Salve e aguarde o link publico ser gerado.

Observacao: a captura de leads ainda esta simulada no navegador via `localStorage`. Para uso real, integrar o formulario com uma ferramenta como CRM, planilha, backend proprio ou plataforma de automacao.
