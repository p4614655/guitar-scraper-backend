FROM node:18

RUN apt-get update && apt-get install -y \
  wget gnupg unzip curl \
  libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libgbm1 \
  libasound2 libpangocairo-1.0-0 libxss1 libgtk-3-0 libxshmfence1 libglu1 \
  chromium

ENV CHROME_BIN=/usr/bin/chromium

WORKDIR /app
COPY . .
RUN npm install

EXPOSE 3000
CMD ["npm", "start"]
