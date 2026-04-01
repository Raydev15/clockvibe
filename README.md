# ClockVibe — Relógio Moderno

Relógio digital e analógico moderno com tema dark/light, cronômetro e timer.

## Tecnologias

- HTML5 semântico
- CSS3 com variáveis customizadas (tema dark/light)
- JavaScript puro (ES2022+) — sem dependências externas
- Google Fonts: Space Grotesk + JetBrains Mono
- Canvas API para partículas animadas

## Funcionalidades

### Relógio
- Relógio analógico com ponteiros suaves e marcadores
- Relógio digital com horas, minutos e segundos
- Indicador AM/PM e fuso horário automático
- Data completa com dia da semana em português
- Barra de progresso do dia (% do dia decorrido)

### Cards de Informação
- Número da semana do ano
- Dia do ano (ex: "Dia 183 / 365")
- Fase lunar calculada
- Unix timestamp em tempo real

### Tema Dark/Light
- Alternância suave com transição CSS
- Preferência salva no `localStorage`
- Partículas animadas adaptadas ao tema

### Cronômetro
- Precisão de centésimos de segundo
- Registrar voltas com tempo delta
- Pausar, continuar e resetar

### Timer
- Configurar horas, minutos e segundos
- Animação de urgência nos últimos 10 segundos
- Alerta visual ao finalizar
- Vibração em dispositivos móveis

## Deploy no GitHub Pages

1. Crie um repositório chamado `clockvibe`
2. Faça upload dos arquivos `index.html`, `style.css` e `script.js`
3. Vá em **Settings → Pages → Source: main branch → / (root)**
4. O site estará em `https://seuusuario.github.io/clockvibe/`

## Estrutura de Arquivos

```
clockvibe/
├── index.html   — Estrutura HTML completa
├── style.css    — Estilos com temas dark/light e responsividade
├── script.js    — Toda a lógica do relógio, cronômetro e timer
└── README.md    — Este arquivo
```
