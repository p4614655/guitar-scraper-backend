FROM node:18

# Install Chromium and dependencies
RUN apt-get update && apt-get install -y \
  wget gnupg unzip curl \
  libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libgbm1 \
  libasound2 libpangocairo-1.0-0 libxss1 libgtk-3-0 libxshmfence1 libglu1 \
  chromium

# Install Chromedriver for Chromium v136
RUN wget -q -O /tmp/chromedriver.zip https://storage.googleapis.com/chrome-for-testing-public/136.0.7103.39/linux64/chromedriver-linux64.zip && \
    unzip /tmp/chromedriver.zip -d /usr/local/bin/ && \
    mv /usr/local/bin/chromedriver-linux64/chromedriver /usr/local/bin/chromedriver && \
    chmod +x /usr/local/bin/chromedriver && \
    rm -rf /tmp/chromedriver.zip /usr/local/bin/chromedriver-linux64

# Set working directory
WORKDIR /app

# Copy source code and install Node.js dependencies
COPY . .
RUN npm install

# Set environment variables for Selenium
ENV CHROME_BIN=/usr/bin/chromium
ENV PATH="/usr/local/bin:$PATH"

CMD ["node", "index.js"]
