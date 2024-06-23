FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install
RUN npm rebuild @tensorflow/tfjs-node --build-from-source
COPY . .

ENV PORT=3000

ENV MODEL_URL=https://storage.googleapis.com/andikhalilmodels/model.json

CMD ["npm", "start"]
