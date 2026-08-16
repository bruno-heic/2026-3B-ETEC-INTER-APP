# Rideless

## Visão Geral

O Rideless estima preços de corrida do Uber, 99 e InDrive usando sua localização atual e destino, depois os ordena do mais barato para o mais caro. Toque em qualquer opção para abrir o app correspondente com a rota já preenchida.

Sem cadastro. Sem chaves de API. Sem rastreamento.

---

## Funcionalidades

- **Comparação de preços em tempo real** entre categorias do Uber, 99 e InDrive
- **Cálculo de rota** via OSRM — sem necessidade do Google Maps
- **Busca de endereços** com Nominatim (OpenStreetMap)
- **Mapa escuro** renderizado com MapLibre GL + tiles CartoDB Dark Matter
- **Detecção de horário de pico** com estimativa automática de surge pricing
- **Refinamento de preços via modelo de ML** consumindo a Rideless API
- **Deep links** para abrir o app de corrida escolhido diretamente
- **Tela de confirmação** com faixa de preço, confiança e probabilidade de aceitação
- **Instruções específicas para a 99** com cópia automática de endereços

---

## Requisitos

- Node.js 18+
- npm 10 ou 11
- Expo Go (iOS ou Android) — para desenvolvimento
- iOS 16+ / Android 10+
- Rideless API rodando e acessível (ver seção abaixo)

---

## Como Começar

Clone o repositório e instale as dependências:

```bash
git clone https://github.com/seu-usuario/rideless-app.git
cd rideless-app
npm install
```

Configure a URL da API no arquivo `services/predict.ts`:

```typescript
const API_URL = "YOUR_API_URL"
```

Inicie o servidor de desenvolvimento:

```bash
npx expo start
```

Escaneie o QR code com o Expo Go no seu dispositivo.

---

## Rideless API

O app consome a **Rideless API** para refinar as estimativas de preço com um modelo de machine learning. Sem ela o app continua funcionando — os preços exibidos serão os do algoritmo estático como fallback.

### Como rodar a API

Consulte o repositório da API para instruções completas de instalação e execução. O resumo é:

```bash
# Na pasta da API
uvicorn main:app --reload --host 0.0.0.0
```

A API precisa estar acessível pelo dispositivo que roda o app. Se estiver rodando no GitHub Codespaces, certifique-se de que a porta está definida como **Public** na aba Ports.

### Como o app consome a API

Ao selecionar uma rota, o app:

1. Calcula o preço estático com o algoritmo local (`services/price.ts`)
2. Manda um `POST /predict` para a API com os dados da corrida
3. Recebe o preço refinado pelo modelo de ML
4. Exibe o `predicted_price` com faixa de preço mínimo e máximo

```
App calcula preco_estimado
        ↓
POST /predict → { distancia_km, duracao_min, hora, plataforma, ... }
        ↓
API retorna → { predicted_price, price_min, price_max, confidence }
        ↓
App exibe o preço refinado
```

Se a API estiver fora do ar, o app usa o preço estático automaticamente via fallback:

```typescript
price: prediction?.predicted_price ?? item.price
```

---

## Lógica de Estimativa de Preços

### Algoritmo estático (ativo hoje)

O Rideless calcula o preço base localmente sem depender de nenhuma API externa:

```
preço = tarifa_base + (preço_por_km × distância) + (preço_por_min × tempo)
```

Em horários de pico (7h–9h e 17h–20h), um multiplicador de surge é aplicado por plataforma. As tarifas são configuradas em `constants/platforms.ts`.

### Modelo preditivo (refinamento via API)

O preço estático é enviado para a Rideless API, onde um modelo de machine learning treinado com 10.000 simulações refina a estimativa levando em conta:

- Distância e tempo da rota
- Horário e dia da semana
- Plataforma e categoria do veículo
- Cenário de demanda e oferta
- Multiplicadores regionais
- Histórico de preços similares

O modelo retorna além do preço refinado:

| Campo | Descrição |
|---|---|
| `predicted_price` | Preço estimado pelo modelo |
| `price_min` | Valor mínimo esperado (−10%) |
| `price_max` | Valor máximo esperado (+10%) |
| `acceptance_probability` | Probabilidade do passageiro aceitar |
| `demand_multiplier` | Multiplicador de demanda aplicado |
| `confidence` | Confiança da previsão (0 a 1) |

### Próxima etapa

Com dados reais de usuários confirmando preços após as corridas, o modelo será retreinado progressivamente. A precisão deve aumentar significativamente conforme mais dados reais substituem as simulações sintéticas.

---

## Estrutura do Projeto

```
rideless-app/
├── app/                      # Telas com Expo Router
│   ├── index.tsx             # Home — permissão de localização
│   ├── search.tsx            # Busca de endereços
│   ├── result.tsx            # Mapa + comparação de preços
│   ├── confirm.tsx           # Tela de confirmação da corrida
│   └── instructions-99.tsx   # Instruções específicas para a 99
├── components/
│   ├── SearchInput.tsx       # Input duplo de endereços com sugestões
│   └── PriceSheet.tsx        # Bottom sheet com lista de preços
├── services/
│   ├── location.ts           # Busca Nominatim + helpers de GPS
│   ├── directions.ts         # Cálculo de rota via OSRM
│   ├── price.ts              # Algoritmo estático de estimativa
│   ├── predict.ts            # Consumo da Rideless API (ML)
│   └── trip-service.ts       # Orquestra rota + preço + predict
├── hooks/
│   └── useTrip.ts            # Hook para buscar rota e preços
├── types/
│   ├── trip.ts               # Interfaces de TripResult e PriceResult
│   └── platform.ts           # Interface de SelectedRide
├── constants/
│   ├── platforms.ts          # Tarifas por plataforma e categoria
│   └── theme.ts              # Tokens de design (cores, fontes, espaçamentos)
└── assets/
    └── fonts/                # Space Mono
```

---

## Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Framework | React Native + Expo SDK 57 |
| Navegação | Expo Router |
| Mapas | MapLibre GL (via WebView) |
| Tiles | CartoDB Dark Matter |
| Roteamento | OSRM |
| Geocodificação | Nominatim (OpenStreetMap) |
| Estimativa de preços | Algoritmo estático + Rideless API (ML) |
| Fonte | Space Mono |

---

## Contribuindo

Pull requests são bem-vindos. Para mudanças maiores, abra uma issue primeiro para discutir o que você gostaria de alterar.

---

## Licença

MIT
