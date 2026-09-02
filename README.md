# Da Despensa

Aplicação web responsiva que encontra receitas a partir de um ingrediente que você já tem em casa. Busque por ingrediente, veja fotos e resultados em grade, abra o modo de preparo passo a passo, marque os ingredientes que já possui e salve receitas nos favoritos — tudo local, sem servidor próprio.

**[Ver aplicação publicada →](#)** *(atualize este link depois do deploy — veja abaixo)*

## Funcionalidades

- Busca por ingrediente com sugestões dinâmicas (autocompletar)
- Botão "Me surpreenda" para receita aleatória
- Grade responsiva de resultados com foto e nome
- Tela de detalhe: imagem, categoria, país de origem, link do vídeo (quando existir)
- Checklist de ingredientes — marque o que já tem, o item fica riscado
- Modo de preparo dividido em passos numerados
- Favoritos salvos no navegador (localStorage), com contador no cabeçalho
- Tema claro / escuro (segue o sistema, com alternância manual)
- Totalmente responsivo, do celular ao desktop
- HTML, CSS e JavaScript puros — sem frameworks, sem build step

## API consumida

[TheMealDB](https://www.themealdb.com/api.php) — API pública e gratuita de receitas, usada com a chave de teste compartilhada `1` (suficiente para projetos de estudo e portfólio; não exige cadastro).

| Endpoint | Uso |
|---|---|
| `list.php?i=list` | Lista de ingredientes, usada para as sugestões de busca |
| `filter.php?i={ingrediente}` | Receitas que contêm o ingrediente buscado |
| `lookup.php?i={id}` | Detalhes completos de uma receita |
| `random.php` | Receita aleatória ("Me surpreenda") |

## Estrutura do projeto

```
da-despensa/
├── index.html          # marcação semântica, meta tags, acessibilidade
├── css/
│   └── styles.css       # design tokens, mobile-first, temas claro/escuro
├── js/
│   └── app.js            # busca, favoritos, fetch da API, renderização
├── assets/
│   └── favicon.svg
├── manifest.json
└── README.md
```

## Rodando localmente

Por ser um site estático, um servidor HTTP simples já é suficiente (necessário para o `fetch` funcionar sem restrições do navegador):

```bash
# Python
python3 -m http.server 8080

# ou Node
npx serve .
```

Depois acesse `http://localhost:8080`.

## Publicando

### GitHub Pages
1. Crie um repositório público no GitHub e envie estes arquivos:
   ```bash
   git init
   git add .
   git commit -m "Primeira versão do Da Despensa"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/da-despensa.git
   git push -u origin main
   ```
2. No repositório, vá em **Settings → Pages**.
3. Em **Source**, selecione a branch `main` e a pasta `/ (root)`.
4. Salve e aguarde alguns instantes. A URL ficará em `https://SEU_USUARIO.github.io/da-despensa/`.

### Vercel / Netlify (alternativa)
1. Importe o repositório do GitHub no [Vercel](https://vercel.com/new) ou [Netlify](https://app.netlify.com/start).
2. Não é necessário comando de build nem diretório de saída — é um site estático (framework: "Other").
3. Clique em "Deploy".

## Checklist de qualidade (Lighthouse)

- **Desempenho**: sem frameworks, CSS/JS pequenos, imagens com `loading="lazy"` e dimensões definidas (evita layout shift), fontes com `font-display: swap`, `preconnect` para fontes e API.
- **Acessibilidade**: HTML semântico, `lang="pt-BR"`, rótulos em todos os campos, `aria-live` para status, contraste de cor testado em ambos os temas, foco visível, link "pular para o conteúdo", checkboxes com `<label>` associado, `prefers-reduced-motion` respeitado.
- **Boas práticas**: HTTPS nas chamadas de API, sem erros de console, `viewport` correto, links externos com `rel="noopener noreferrer"`.
- **SEO**: `title`, `meta description`, HTML válido, texto legível sem zoom.

## Licença

Uso livre para fins educacionais.
