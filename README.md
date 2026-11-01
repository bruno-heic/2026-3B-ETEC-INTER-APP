# Rideless

Compare preços de corrida entre Uber e 99, descubra onde embarcar para pagar menos (e com que nível de risco) e acompanhe quanto você gasta.

## Visão Geral

O Rideless estima o preço de corridas do Uber e 99 a partir da sua localização e do destino, ordenando as opções do mais barato para o mais caro. Ao escolher uma opção, o app abre a plataforma correspondente com a rota já preenchida.

O app conta com duas APIs próprias:

- **Rideless API:** um modelo de machine learning que refina o preço estimado e informa faixa de preço, confiança e probabilidade de aceitação.
- **Location Risk API:** analisa a densidade de ocorrências criminais ao redor do usuário e sugere **pontos de embarque e horários mais baratos**, informando o **nível de risco** de cada ponto. Assim, o usuário escolhe entre economia e segurança.

Além disso, o app guarda o histórico de corridas de cada usuário e mostra gráficos e estatísticas dos seus gastos.

## Funcionalidades

### Consulta e comparação
- **Comparação de preços** entre categorias do Uber, 99 e InDrive
- **Cálculo de rota** via OSRM, sem necessidade do Google Maps
- **Busca de endereços** com Nominatim (OpenStreetMap)
- **Mapa escuro** renderizado com MapLibre GL + tiles CartoDB Dark Matter
- **Detecção de horário de pico** com estimativa automática de surge pricing
- **Refinamento de preços via modelo de ML**, consumindo a Rideless API
- **Tela de confirmação** com faixa de preço, confiança e probabilidade de aceitação
- **Deep links** para abrir o app de corrida escolhido com a rota preenchida
- **Instruções específicas para a 99**, com cópia automática de endereços

### Recomendações de economia e segurança
- Sugestão de **pontos de embarque próximos** onde a mesma corrida custa menos
- **Nível de risco** de cada ponto (baixo, médio ou alto), calculado a partir de ocorrências criminais num raio de 500 m
- Exibição da **distância de caminhada**, da **economia estimada** e do novo preço
- Sugestão de **horário**: quando esperar um pouco faz o preço cair
- Linha tracejada no mapa ligando a origem ao ponto recomendado

### Conta
- **Cadastro e login** com Supabase Auth
- **Perfil** com edição de nome, e-mail e senha
- **Exclusão de conta** dentro do app, com remoção dos dados do usuário

### Histórico e insights
- **Histórico de corridas** agrupado por mês, com detalhes expansíveis e botão para pedir novamente
- **Filtro de período** (7 dias, 30 dias ou tudo)
- **Gráficos** de gastos por período, gastos por plataforma, tendência de preço e corridas por dia da semana
- **Estatísticas:** ticket médio, preço por km, distância e tempo totais, economia total, corrida mais cara, destino frequente e horário mais comum
- **Comparação** do total gasto com o período anterior

### Atalhos de rotas
- Cadastro de rotas frequentes (casa, trabalho etc.), salvas por usuário
- Criar, editar e excluir atalhos
- Abertura da rota no mapa com um toque

### Configurações
- Confirmar antes de abrir o app da plataforma
- Salvar (ou não) as corridas no histórico
- Período inicial e exibição de gráficos no histórico
- Status da permissão de localização, com atalho para os ajustes do sistema
- Limpar histórico, apagar atalhos e excluir conta
- Feedback, termos de uso, política de privacidade e versão do app

### Home
- Saudação e acesso rápido ao perfil
- **Resumo do mês:** total gasto, número de corridas, ticket médio e economia
- Carrossel de atalhos e as corridas mais recentes
- Atualização ao voltar para a tela e por pull to refresh

## Telas

| Tela | Rota | Descrição |
|---|---|---|
| Home | `/(tabs)/index` | Resumo do mês, atalhos, corridas recentes e opções |
| Busca | `/search` | Busca de origem e destino |
| Resultado | `/result` | Mapa com a rota e bandeja de preços |
| Recomendações | `/recommendations` | Pontos de embarque e horários mais baratos, com nível de risco |
| Confirmação | `/confirm` | Resumo da corrida e abertura do app da plataforma |
| Instruções 99 | `/instructions99` | Passo a passo e cópia de endereços para a 99 |
| Histórico | `/RideHistory` | Corridas salvas, gráficos e estatísticas |
| Atalhos | `/(tabs)/FavoriteRides` | Rotas favoritas do usuário |
| Perfil | `/(tabs)/account` | Dados da conta e sair |
| Configurações | `/(tabs)/settings` | Preferências, privacidade e sobre |
| Autenticação | `/(auth)/signIn` | Login e cadastro |

## Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Framework | React Native + Expo SDK 57 |
| Navegação | Expo Router |
| Autenticação e banco | Supabase (Auth, Postgres e RLS) |
| Mapas | MapLibre GL (via WebView) |
| Tiles | CartoDB Dark Matter |
| Roteamento | OSRM |
| Geocodificação | Nominatim (OpenStreetMap) e `expo-location` |
| Gráficos | `react-native-gifted-charts` + `react-native-svg` |
| Armazenamento local | `@react-native-async-storage/async-storage` (preferências) |
| Estimativa de preços | Algoritmo estático + Rideless API (ML) |
| Risco e recomendações | Location Risk API (FastAPI, BallTree/Haversine) |

## Requisitos

- Node.js 18+
- npm 10 ou 11
- Expo Go (iOS ou Android) para desenvolvimento
- iOS 16+ / Android 10+
- Projeto no [Supabase](https://supabase.com)
- Rideless API e Location Risk API rodando e acessíveis (ver seções abaixo)

## Como Começar

Clone o repositório e instale as dependências:

```bash
git clone https://github.com/seu-usuario/rideless-app.git
cd rideless-app
npm install
```

### 1. Supabase

Crie um projeto no Supabase e informe a URL e a chave `anon` no client do app (`services/supabase.ts`):

```typescript
const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";
```

Depois, no **SQL Editor** do Supabase, crie as tabelas descritas na seção [Banco de dados](#banco-de-dados).

### 2. APIs

Configure a URL da **Rideless API** (previsão de preço) em `services/predict.ts`:

```typescript
const API_URL = "YOUR_API_URL";
```

Configure a URL da **Location Risk API** (risco e recomendações) em `services/intelligence.ts`:

```typescript
const INTELLIGENCE_URL = "YOUR_API_URL";
```

### 3. Executar

```bash
npx expo start
```

Escaneie o QR code com o Expo Go no seu dispositivo.

## Banco de dados

O app usa três tabelas no schema `public`. Todas têm **Row Level Security** ativa: cada usuário só lê, cria, altera e apaga as próprias linhas (`auth.uid() = user_id`).

### `users`

Dados básicos da conta, com `id` igual ao id do Supabase Auth.

| Coluna | Tipo |
|---|---|
| `id` | uuid (chave primária, igual ao `auth.users.id`) |
| `created_at` | timestamptz |
| `email` | text |
| `name` | text |

### `rides`

Corridas confirmadas pelo usuário.

| Grupo | Colunas |
|---|---|
| Identificação | `id`, `created_at`, `updated_at`, `user_id` |
| Origem e destino | `origin_name`, `origin_lat`, `origin_lon`, `dest_name`, `dest_lat`, `dest_lon` |
| Trajeto | `distance_km`, `duration_min`, `route_coordinates` (jsonb, opcional) |
| Opção escolhida | `platform_id`, `platform_name`, `platform_app`, `product_id`, `price`, `price_min`, `price_max`, `confidence`, `acceptance_probability`, `currency` |
| Recomendação | `used_recommendation`, `rec_lat`, `rec_lon`, `rec_distance_meters`, `economy` |
| Status | `status`: `estimated`, `requested`, `completed` ou `cancelled` |

### `favorite_routes`

Atalhos de rotas de cada usuário.

| Coluna | Tipo |
|---|---|
| `id`, `created_at`, `updated_at`, `user_id` | identificação |
| `label` | nome do atalho |
| `origin_name`, `origin_lat`, `origin_lon` | origem |
| `dest_name`, `dest_lat`, `dest_lon` | destino |

### Função `delete_my_account()`

Função `security definer` chamada pela tela de configurações (`supabase.rpc("delete_my_account")`). Ela apaga as corridas, os atalhos, o registro em `users` e o usuário do Supabase Auth, tudo do usuário logado. Se você criar novas tabelas ligadas ao usuário, inclua-as nessa função.

## Rideless API (previsão de preço)

O app consome a **Rideless API** para refinar as estimativas de preço com um modelo de machine learning. Sem ela o app continua funcionando: os preços exibidos serão os do algoritmo estático, como fallback. O client fica em `services/predict.ts`.

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

Se a API estiver fora do ar, o app usa o preço estático automaticamente:

```typescript
price: prediction?.predicted_price ?? item.price
```

## Location Risk API (risco e recomendações)

O arquivo `services/intelligence.ts` é o client da **Location Risk API**, que cuida de duas coisas: avaliar o **risco de uma localização** e gerar **recomendações de economia** (onde embarcar e quando pedir) já com o nível de risco de cada sugestão.

Repositório da API: [bruno-heic/2026-3B-ETEC-INTER-LOCATION-RISK-API](https://github.com/bruno-heic/2026-3B-ETEC-INTER-LOCATION-RISK-API)

### Como o app consome a API

Na bandeja de preços, o item **"Recomendações de economia"** abre a tela de recomendações enviando os dados da viagem. O app chama a API e recebe até três opções de embarque, uma para cada nível de risco, além de uma sugestão de horário quando vale a pena esperar.

```
Usuário toca em "Recomendações de economia"
        ↓
POST /recommend → { lat, lon, dest_lat, dest_lon, distancia_km, duracao_min,
                    hora, dia_semana, plataforma, categoria, preco_estimado }
        ↓
API retorna → { current_price, time_recommendation, location_recommendations[] }
        ↓
App exibe os pontos (distância, economia, novo preço e risco)
        ↓
Ao escolher um ponto, o mapa mostra o ponto e a linha tracejada até ele
```

O app mapeia cada item de `location_recommendations` para o tipo `LocationRecommendation` (latitude, longitude, `distance_meters`, `economy` e demais campos devolvidos pela API).

### Endpoints

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/` | Status da API |
| `POST` | `/risk` | Avalia o nível de risco de uma área |
| `POST` | `/recommend` | Gera recomendações de economia e segurança |

**`POST /risk`**

```json
{ "lat": -23.5505, "lon": -46.6333 }
```

```json
{
  "risk_level": "high",
  "risk_label": "Alto",
  "total_crimes_nearby": 108,
  "radius_meters": 500,
  "most_common_crime": "Roubo a pedestre"
}
```

**`POST /recommend`** (resposta resumida)

```json
{
  "current_price": 45.58,
  "time_recommendation": {
    "type": "time",
    "message": "Aguarde até as 20h — preço tende a cair",
    "economy": 8.50,
    "hora_sugerida": 20,
    "risk_level": null
  },
  "location_recommendations": [
    {
      "type": "location",
      "lat": -23.6237,
      "lon": -46.6566,
      "distance_meters": 400,
      "economy": 13.46,
      "new_price": 32.12,
      "risk_level": "low",
      "risk_label": "Baixo",
      "total_crimes_nearby": 2,
      "most_common_crime": "Furto de veículo"
    }
  ]
}
```

A documentação interativa (Swagger) fica em `/docs` quando a API está rodando.

### Como a API funciona

**Avaliação de risco.** A API carrega um dataset de ocorrências com coordenadas e usa uma **BallTree** com métrica **Haversine** para buscar, em milissegundos, os crimes dentro de um raio de **500 m** do ponto. Ela conta as ocorrências, identifica o tipo mais comum e classifica o nível de risco:

| Ocorrências no raio | Nível |
|---|---|
| 0 a 3 | Baixo |
| 4 a 8 | Médio |
| 9 ou mais | Alto |

**Recomendações de localização.** A partir da posição do usuário, a API gera **40 pontos alternativos**: 8 direções (N, NE, E, SE, S, SW, W, NW) em 5 distâncias (100 m a 500 m). Para cada ponto calcula a nova distância até o destino, o novo preço estimado e o nível de risco da área. Descarta pontos com economia menor que R$ 2,00 e devolve o melhor de cada nível de risco, ou seja, **até 3 opções** para o usuário escolher entre economia e segurança.

**Recomendações de horário.** A API compara o multiplicador de preço do horário atual com o da próxima hora. Se a economia for maior que R$ 2,00, sugere aguardar.

| Horário | Multiplicador |
|---|---|
| 0h – 5h | 0,80 (baixa demanda) |
| 5h – 7h | 0,90 |
| 7h – 10h | 1,40 (pico da manhã) |
| 10h – 16h | 1,00 (normal) |
| 16h – 20h | 1,35 (pico da tarde) |
| 20h – 24h | 1,10 |

### Como rodar a API

Requisitos: Python 3.12+, pip 24+ e o arquivo `dataset-limpo.csv` na raiz do projeto da API.

```bash
git clone https://github.com/bruno-heic/2026-3B-ETEC-INTER-LOCATION-RISK-API.git
cd 2026-3B-ETEC-INTER-LOCATION-RISK-API
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install fastapi uvicorn pandas numpy scikit-learn scipy

# acessível pelo celular (necessário para o app mobile)
uvicorn main:app --reload --host 0.0.0.0
```

No **GitHub Codespaces**, depois de iniciar a API, abra a aba **Ports**, clique com o botão direito na porta **8000** e escolha **Port Visibility → Public**. Copie a URL gerada para `INTELLIGENCE_URL` em `services/intelligence.ts`.

### Dataset e limitações

- O dataset reúne ocorrências registradas na **cidade de São Paulo**, com coordenadas, e tem 15.524 registros válidos após a limpeza.
- Fora de São Paulo, ou em áreas sem registros, o nível de risco **não é confiável** (poucas ocorrências aparecem como risco baixo).
- O nível de risco é um **indicador estatístico baseado em ocorrências passadas**. Ele não prevê crimes nem garante segurança, e deve ser apresentado ao usuário como apoio à decisão.

## Lógica de Estimativa de Preços

### Algoritmo estático

O Rideless calcula o preço base localmente, sem depender de nenhuma API externa:

```
preço = tarifa_base + (preço_por_km × distância) + (preço_por_min × tempo)
```

Em horários de pico (7h–9h e 17h–20h), um multiplicador de surge é aplicado por plataforma. As tarifas são configuradas em `constants/platforms.ts`.

### Modelo preditivo

O preço estático é enviado para a Rideless API, onde um modelo de machine learning treinado com 10.000 simulações refina a estimativa levando em conta:

- Distância e tempo da rota
- Horário e dia da semana
- Plataforma e categoria do veículo
- Cenário de demanda e oferta
- Multiplicadores regionais
- Histórico de preços similares

O modelo retorna, além do preço refinado:

| Campo | Descrição |
|---|---|
| `predicted_price` | Preço estimado pelo modelo |
| `price_min` | Valor mínimo esperado (−10%) |
| `price_max` | Valor máximo esperado (+10%) |
| `acceptance_probability` | Probabilidade do passageiro aceitar |
| `demand_multiplier` | Multiplicador de demanda aplicado |
| `confidence` | Confiança da previsão (0 a 1) |

## Estrutura do projeto

Principais arquivos e pastas do app:

```
app/
  (auth)/            telas de login e cadastro
  (account)/         edição de nome, e-mail e senha
  (tabs)/            home, perfil, configurações e atalhos
  search.tsx         busca de origem e destino
  result.tsx         mapa e bandeja de preços
  recommendations.tsx recomendações de embarque e horário
  confirm.tsx        confirmação e abertura do app da plataforma
  RideHistory.tsx    histórico, gráficos e estatísticas
components/
  priceSheet.tsx     bandeja de preços sobre o mapa
  mainOptions.tsx    atalhos para histórico, perfil e configurações
constants/
  theme.ts           cores, fontes e tamanhos
  platforms.ts       tarifas por plataforma
services/
  auth.ts            autenticação e dados do usuário
  supabase.ts        client do Supabase
  predict.ts         client da Rideless API (previsão de preço)
  intelligence.ts    client da Location Risk API (risco e recomendações)
  location.ts        geocodificação e rotas
  price.ts           algoritmo estático de preço
  trip-service.ts    consolidação de preços de uma viagem
  settings.ts        preferências do usuário (AsyncStorage)
types/
  trip.ts            tipos de viagem e preços
```

Estrutura da Location Risk API (repositório separado):

```
main.py               endpoints da API
schemas.py            validação dos dados de entrada
database.py           carregamento do dataset de ocorrências em memória
risk_service.py       cálculo de risco por densidade de ocorrências
recommend_service.py  recomendações de localização e horário
dataset-limpo.csv     dataset de ocorrências de São Paulo
```

## Privacidade e dados

- Cada usuário só acessa os próprios dados, garantido por RLS no banco.
- O histórico guarda origem, destino e valores das corridas que o usuário confirma. É possível desligar o salvamento automático nas configurações.
- O usuário pode **limpar o histórico**, **apagar os atalhos** e **excluir a conta** a qualquer momento, direto no app.
- As preferências de interface ficam no aparelho, separadas por conta.
- Para calcular preços e recomendações, o app envia às APIs as coordenadas de origem e destino e os dados da viagem (distância, duração, horário, plataforma e categoria). Não são enviados dados da conta do usuário.
- O app não solicita nem armazena credenciais das plataformas de corrida: a corrida é feita no app do Uber, 99 ou InDrive.

## Próximas etapas

- Retreinar o modelo de previsão com dados reais de corridas confirmadas, substituindo progressivamente as simulações sintéticas
- Ampliar a cobertura do dataset de ocorrências para além de São Paulo
- Registrar o desfecho da corrida (concluída ou cancelada) para melhorar histórico e métricas
- Sincronizar preferências entre dispositivos
- Notificações de variação de preço

## Licença

MIT
