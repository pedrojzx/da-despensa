# Da Despensa

Progressive Web App (PWA) que encontra receitas a partir de um ingrediente que você já tem em casa. Instalável no celular ou no computador, funciona com a tela inicial própria (sem barra do navegador), guarda o essencial em cache para abrir mesmo com internet instável, e usa o **microfone do dispositivo** para busca por voz.

**[Ver aplicação publicada →](#)** (https://pedrojzx.github.io/da-despensa/)

## Funcionalidades

- Busca por ingrediente com sugestões dinâmicas (autocompletar)
- **Busca por voz**: toque no ícone de microfone e diga o ingrediente em voz alta (usa a Web Speech API, acessando o microfone do aparelho)
- Botão "Me surpreenda" para receita aleatória
- Grade responsiva de resultados com foto e nome
- Tela de detalhe: imagem, categoria, país de origem, link do vídeo (quando existir)
- Checklist de ingredientes — marque o que já tem, o item fica riscado
- Modo de preparo dividido em passos numerados
- Favoritos salvos no navegador (localStorage), com contador no cabeçalho
- Tema claro / escuro (segue o sistema, com alternância manual)
- **Instalável como app** (ícone na tela inicial, abre em janela própria)
- **Funciona offline** para a casca do app (service worker em cache)
- Totalmente responsivo, do celular ao desktop

## Recurso de hardware utilizado

**Microfone**, via [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) (`SpeechRecognition`). Ao tocar no botão de microfone ao lado da busca, o navegador pede permissão de acesso ao microfone do dispositivo, ouve o que a pessoa diz em português e usa o texto reconhecido como termo de busca — pensado para quando as mãos estão ocupadas ou sujas durante o preparo de uma receita.

> Suporte: funciona em Chrome/Edge (desktop e Android) e na maioria dos navegadores baseados em Chromium. O Safari no iOS não implementa `SpeechRecognition`, então nesses aparelhos o botão de microfone fica automaticamente oculto e a busca por texto continua funcionando normalmente — a aplicação detecta o recurso antes de exibir o botão.

## O que faz esta aplicação ser um PWA

| Requisito | Como foi implementado |
|---|---|
| Instalável | `manifest.json` com nome, ícones (192px, 512px e versão *maskable*), `display: standalone` e cores de tema; Chrome/Edge/Android oferecem "Instalar app" automaticamente |
| Funciona offline (casco da app) | `service-worker.js` armazena em cache o HTML, CSS, JS e ícones; as chamadas à API de receitas continuam indo para a rede, pois os dados precisam estar atualizados |
| Ícone e tela inicial | Ícones PNG dedicados + `apple-touch-icon` para adicionar à tela inicial no iOS |
| HTTPS | Necessário para o service worker funcionar — GitHub Pages, Vercel e Netlify já servem em HTTPS por padrão |

## API consumida

[TheMealDB](https://www.themealdb.com/api.php) — API pública e gratuita de receitas, usada com a chave de teste compartilhada `1`.

| Endpoint | Uso |
|---|---|
| `list.php?i=list` | Lista de ingredientes, usada para as sugestões de busca |
| `filter.php?i={ingrediente}` | Receitas que contêm o ingrediente buscado |
| `lookup.php?i={id}` | Detalhes completos de uma receita |
| `random.php` | Receita aleatória ("Me surpreenda") |

## Estrutura do projeto

```
da-despensa/
├── index.html            # marcação semântica, meta tags, registro do service worker
├── service-worker.js      # cache do app shell para funcionamento offline/instalável
├── manifest.json          # configuração do PWA (ícones, cores, modo standalone)
├── css/
│   └── styles.css          # design tokens, mobile-first, temas claro/escuro
├── js/
│   └── app.js               # busca, voz, favoritos, fetch da API, renderização
├── assets/
│   ├── favicon.svg
│   ├── icon-192.png
│   ├── icon-512.png
│   ├── icon-512-maskable.png
│   └── apple-touch-icon.png
└── README.md
```

## Rodando localmente

Por ser um site estático, um servidor HTTP simples já é suficiente:

```bash
# Python
python3 -m http.server 8080

# ou Node
npx serve .
```

Depois acesse `http://localhost:8080`. Service workers funcionam em `localhost` mesmo sem HTTPS, então dá pra testar a instalação e o modo offline localmente.

## Publicando

### GitHub Pages
1. Crie um repositório público no GitHub e envie estes arquivos (pelo terminal com git, ou arrastando os arquivos direto pela interface web do GitHub).
2. No repositório, vá em **Settings → Pages**.
3. Em **Source**, selecione a branch `main` e a pasta `/ (root)`.
4. Salve e aguarde alguns instantes. A URL ficará em `https://SEU_USUARIO.github.io/da-despensa/`.

### Vercel / Netlify (alternativa)
1. Importe o repositório do GitHub no [Vercel](https://vercel.com/new) ou [Netlify](https://app.netlify.com/start).
2. Não é necessário comando de build nem diretório de saída — é um site estático (framework: "Other").
3. Clique em "Deploy".

## Como testar a instalação como PWA

1. Abra a URL publicada no **Chrome (Android ou desktop)**.
2. No celular: toque no menu (⋮) → "Adicionar à tela inicial" ou "Instalar app". No desktop: um ícone de instalação aparece na barra de endereço, ou use o botão "Instalar app" que aparece no próprio cabeçalho da aplicação.
3. Abra o app instalado — ele roda em janela própria, sem a barra do navegador.
4. Para testar o modo offline: com o app aberto, ative o modo avião e recarregue — a interface (casco do app) continua abrindo; apenas a busca de receitas exigirá conexão, já que os dados vêm de uma API externa.
5. Para testar a busca por voz: toque no ícone de microfone, permita o acesso quando solicitado, e diga um ingrediente em voz alta.

## Checklist de qualidade (Lighthouse)

- **PWA / Instalável**: manifest completo, ícones nos tamanhos exigidos, service worker registrado, HTTPS.
- **Desempenho**: sem frameworks, CSS/JS pequenos, imagens com `loading="lazy"` e dimensões definidas, fontes com `font-display: swap`.
- **Acessibilidade**: HTML semântico, `lang="pt-BR"`, rótulos em todos os campos, `aria-live` para status e para o estado do microfone, contraste testado em ambos os temas, foco visível, `prefers-reduced-motion` respeitado.
- **Boas práticas**: HTTPS nas chamadas de API, sem erros de console, links externos com `rel="noopener noreferrer"`.
- **SEO**: `title`, `meta description`, HTML válido.

## Licença

Uso livre para fins educacionais.
