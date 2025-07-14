# Manorath Server

Backend server for the Manorath Dream Market platform, built with Express.js and Sui blockchain integration.

## Features

- **RESTful API** for dreams, pledges, vaults, and users
- **Sui blockchain integration** with event listening
- **Automated vault processing** based on blockchain events
- **JSON file-based database** for development and testing
- **Real-time event monitoring** and processing
- **Scheduled tasks** for vault eligibility checks

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Required environment variables**
   ```env
   SUI_RPC_URL=https://fullnode.testnet.sui.io:443
   SUI_NETWORK=testnet
   ADMIN_PRIVATE_KEY=your_admin_private_key
   ADMIN_ADDRESS=your_admin_address
   PACKAGE_ID=your_deployed_package_id
   PORT=5000
   ```

4. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## API Endpoints

### Dreams
- `GET /api/dreams` - Get all dreams (with filters)
- `GET /api/dreams/:id` - Get dream by ID
- `POST /api/dreams` - Create new dream
- `PATCH /api/dreams/:id` - Update dream (approve/reject)
- `GET /api/dreams/stats/overview` - Get dream statistics

### Pledges
- `GET /api/pledges` - Get all pledges
- `GET /api/pledges/dream/:dreamId` - Get pledges for a dream
- `POST /api/pledges` - Create new pledge
- `GET /api/pledges/stats/overview` - Get pledge statistics

### Vaults
- `GET /api/vaults` - Get all vaults
- `GET /api/vaults/:id` - Get vault by ID
- `POST /api/vaults` - Create new vault
- `PATCH /api/vaults/:id/contribution` - Record monthly contribution
- `POST /api/vaults/:id/release` - Release vault match
- `GET /api/vaults/stats/overview` - Get vault statistics

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:address` - Get user by address
- `POST /api/users` - Create/update user profile
- `PATCH /api/users/:address` - Update user profile
- `GET /api/users/stats/overview` - Get user statistics

### General
- `GET /health` - Health check
- `GET /api/stats` - Global platform statistics

## Database Structure

The server uses JSON files for data storage:

- `db/dreams.json` - Dream NFT records
- `db/pledges.json` - Pledge transaction records
- `db/vaults.json` - NGO vault records
- `db/users.json` - User profile records
- `db/events.json` - Blockchain event records

## Event Listening

The server automatically listens to blockchain events:

- **DreamCreated** - New dream NFT minted
- **DreamApproved** - Dream approved by NGO
- **PledgeMade** - Pledge made to a dream
- **VaultCreated** - New NGO vault created
- **MonthlyContribution** - Monthly contribution recorded
- **MatchReleased** - Vault match funds released

## Automated Processing

- **Vault Eligibility**: Automatically checks and releases vault matches when conditions are met
- **Dream Completion**: Updates dream status when goal is reached
- **Event Processing**: Processes blockchain events and updates database
- **Scheduled Tasks**: Hourly checks for vault eligibility

## Development

### Project Structure
```
server/
├── config/          # Configuration files
├── db/             # JSON database files
├── routes/         # API route handlers
├── services/       # Business logic services
├── index.js        # Main server file
└── package.json    # Dependencies and scripts
```

### Adding New Features

1. **New API endpoints**: Add routes in the `routes/` directory
2. **Business logic**: Add services in the `services/` directory
3. **Database operations**: Extend the database service
4. **Event handling**: Add handlers in the event listener service

### Testing

```bash
# Test API endpoints
curl http://localhost:5000/health

# Test with specific filters
curl "http://localhost:5000/api/dreams?status=approved"
```

## Production Deployment

1. **Environment setup**
   - Set `NODE_ENV=production`
   - Configure proper database (replace JSON files)
   - Set up monitoring and logging

2. **Security considerations**
   - Use HTTPS in production
   - Implement rate limiting
   - Add authentication/authorization
   - Secure environment variables

3. **Scaling**
   - Use a proper database (PostgreSQL, MongoDB)
   - Implement caching (Redis)
   - Add load balancing
   - Set up monitoring and alerts

## Troubleshooting

### Common Issues

1. **Event listener not working**
   - Check `PACKAGE_ID` is correctly set
   - Verify network connectivity to Sui RPC
   - Ensure admin keypair is properly configured

2. **Vault processing fails**
   - Check admin wallet has sufficient SUI for gas
   - Verify contract functions are deployed correctly
   - Check transaction logs for errors

3. **API errors**
   - Check server logs for detailed error messages
   - Verify request format and required fields
   - Ensure database files are accessible

### Logs

The server provides detailed logging:
- Request/response logging via Morgan
- Error logging for failed operations
- Event processing logs
- Scheduled task execution logs