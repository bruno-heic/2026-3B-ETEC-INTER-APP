# Rideless

## Visão Geral
 
O Rideless estima preços de corrida do Uber, 99 e InDrive usando sua localização atual e destino, depois os ordena do mais barato para o mais caro. Toque em qualquer opção para abrir o app correspondente com a rota já preenchida.
 
Sem cadastro. Sem chaves de API. Sem rastreamento.
  
## Funcionalidades
 
- **Comparação de preços em tempo real** entre categorias do Uber, 99 e InDrive
- **Cálculo de rota** via OSRM — sem necessidade do Google Maps
- **Busca de endereços** com Nominatim (OpenStreetMap)
- **Mapa escuro** renderizado com MapLibre GL + tiles CartoDB Dark Matter
- **Detecção de horário de pico** com estimativa automática de surge pricing
- **Deep links** para abrir o app de corrida escolhido diretamente

## Requisitos
 
- Node.js 18+
- npm 10 ou 11
- Expo Go (iOS ou Android) — para desenvolvimento
- iOS 16+ / Android 10+

## Como Começar
 
Clone o repositório e instale as dependências:
 
```bash
git clone https://github.com/seu-usuario/rideless.git
cd rideless
npm install
```
 
Inicie o servidor de desenvolvimento:
 
```bash
npx expo start
```
 
Escaneie o QR code com o Expo Go no seu dispositivo.
 

## Lógica de estimativa de preços
 
O Rideless não acessa APIs de preços em tempo real. Todos os valores são estimativas baseadas nas tarifas publicamente conhecidas de cada plataforma:
 
```
preço = tarifa_base + (preço_por_km × distância) + (preço_por_min × tempo)
```
 
Em horários de pico (7h–9h e 17h–20h), um multiplicador de surge é aplicado por plataforma. Os preços reais podem variar.
 
Nesta versão MVP, as tarifas são estáticas e definidas manualmente em `constants/platforms.ts`. O objetivo é validar o fluxo do produto e coletar dados reais de corridas dos usuários antes de evoluir o modelo.
 
### Próxima etapa: Modelo preditivo com dados reais
 
Após a coleta de dados suficientes via confirmação de preço pelos usuários, o plano é substituir o algoritmo estático por um modelo de machine learning treinado com dados reais. O modelo levará em conta:
 
- **Histórico de preços** por plataforma, categoria, região e horário
- **Variáveis externas** como clima, eventos na cidade e feriados
- **Padrões de surge pricing** identificados ao longo do tempo

A implementação será feita em Python com `scikit-learn` ou `XGBoost`, exposta via uma API REST consumida pelo app. O modelo será retreinado periodicamente conforme novos dados forem coletados, aumentando progressivamente a precisão das estimativas.
## Stack Tecnológica
 
| Camada | Tecnologia |
|---|---|
| Framework | React Native + Expo SDK 57 |
| Navegação | Expo Router |
| Mapas | MapLibre GL (via WebView) |
| Tiles | CartoDB Dark Matter |
| Roteamento | OSRM |
| Geocodificação | Nominatim (OpenStreetMap) |
| Fonte | Space Mono |
 
## Contribuindo
 
Pull requests são bem-vindos. Para mudanças maiores, abra uma issue primeiro para discutir o que você gostaria de alterar.
 
## Licença
 
MIT
