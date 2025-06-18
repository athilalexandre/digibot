// Configuração do ambiente de teste
process.env.NODE_ENV = 'test';
process.env.PORT = 3001;
process.env.MONGODB_URI = 'mongodb://localhost:27017/digibot-test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_EXPIRES_IN = '1h';
process.env.BOT_USERNAME = 'testbot';
process.env.BOT_OAUTH_TOKEN = 'oauth:test-token';
process.env.CHANNEL_NAME = 'testchannel';
process.env.TWITCH_CLIENT_ID = 'test-client-id';
process.env.TWITCH_CLIENT_SECRET = 'test-client-secret';
process.env.TWITCH_REDIRECT_URI = 'http://localhost:3001/auth/twitch/callback';
process.env.LOG_LEVEL = 'error';
process.env.LOG_DIR = 'logs/test';
process.env.CORS_ORIGIN = '*';
process.env.RATE_LIMIT_WINDOW = 900000;
process.env.RATE_LIMIT_MAX = 100;
process.env.DEFAULT_COOLDOWN = 5;
process.env.DEFAULT_COST = 0;
process.env.COMMAND_PREFIX = '!';
process.env.POINTS_PER_MESSAGE = 1;
process.env.POINTS_PER_MINUTE = 5;
process.env.POINTS_PER_SUB = 100;
process.env.POINTS_PER_FOLLOW = 50;
process.env.POINTS_PER_RAID = 25;

// Configuração global do Jest
jest.setTimeout(10000);

// Limpa todos os mocks após cada teste
afterEach(() => {
  jest.clearAllMocks();
});

// Limpa todos os mocks antes de cada teste
beforeEach(() => {
  jest.resetAllMocks();
});

// Limpa todos os mocks após todos os testes
afterAll(() => {
  jest.restoreAllMocks();
}); 