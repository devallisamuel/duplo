# Azure Deployment Guide

This guide covers multiple approaches to deploy the Bookmark Manager API to Microsoft Azure.

## Deployment Options

1. **Azure Container Apps** (Recommended) - Serverless containers, easiest setup
2. **Azure App Service** - Traditional PaaS, good for Node.js apps
3. **Azure Kubernetes Service (AKS)** - For production-scale deployments
4. **Azure Container Instances** - Simple container deployment

---

## Option 1: Azure Container Apps (Recommended) ⭐

**Best for:** Modern cloud-native apps, automatic scaling, cost-effective

### Prerequisites

- Azure CLI installed: `az --version`
- Docker installed
- Azure subscription

### Step 1: Install Azure CLI

```bash
# Windows (PowerShell)
winget install Microsoft.AzureCLI

# macOS
brew install azure-cli

# Linux
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
```

### Step 2: Login to Azure

```bash
az login
az account set --subscription "YOUR_SUBSCRIPTION_ID"
```

### Step 3: Create Resource Group

```bash
# Set variables
RESOURCE_GROUP="bookmark-manager-rg"
LOCATION="eastus"
CONTAINER_APP_ENV="bookmark-env"
CONTAINER_APP_NAME="bookmark-api"
ACR_NAME="bookmarkregistry"  # Must be globally unique

# Create resource group
az group create \
  --name $RESOURCE_GROUP \
  --location $LOCATION
```

### Step 4: Create Azure Container Registry (ACR)

```bash
# Create ACR
az acr create \
  --resource-group $RESOURCE_GROUP \
  --name $ACR_NAME \
  --sku Basic \
  --admin-enabled true

# Login to ACR
az acr login --name $ACR_NAME
```

### Step 5: Build and Push Docker Image

```bash
# Build image
docker build -t $ACR_NAME.azurecr.io/bookmark-api:latest .

# Push to ACR
docker push $ACR_NAME.azurecr.io/bookmark-api:latest
```

### Step 6: Create Azure Database for PostgreSQL

```bash
# Create PostgreSQL server
az postgres flexible-server create \
  --resource-group $RESOURCE_GROUP \
  --name bookmark-postgres \
  --location $LOCATION \
  --admin-user dbadmin \
  --admin-password "YourSecurePassword123!" \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --version 16 \
  --storage-size 32 \
  --public-access 0.0.0.0

# Create database
az postgres flexible-server db create \
  --resource-group $RESOURCE_GROUP \
  --server-name bookmark-postgres \
  --database-name bookmark_manager
```

### Step 7: Create Container Apps Environment

```bash
az containerapp env create \
  --name $CONTAINER_APP_ENV \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION
```

### Step 8: Deploy Container App

```bash
# Get ACR credentials
ACR_USERNAME=$(az acr credential show --name $ACR_NAME --query username -o tsv)
ACR_PASSWORD=$(az acr credential show --name $ACR_NAME --query passwords[0].value -o tsv)

# Get PostgreSQL connection string
DB_HOST=$(az postgres flexible-server show --resource-group $RESOURCE_GROUP --name bookmark-postgres --query fullyQualifiedDomainName -o tsv)

# Deploy container app
az containerapp create \
  --name $CONTAINER_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --environment $CONTAINER_APP_ENV \
  --image $ACR_NAME.azurecr.io/bookmark-api:latest \
  --registry-server $ACR_NAME.azurecr.io \
  --registry-username $ACR_USERNAME \
  --registry-password $ACR_PASSWORD \
  --target-port 3000 \
  --ingress external \
  --min-replicas 1 \
  --max-replicas 3 \
  --cpu 0.5 \
  --memory 1Gi \
  --env-vars \
    NODE_ENV=production \
    PORT=3000 \
    API_PREFIX=v1 \
    DB_HOST=$DB_HOST \
    DB_PORT=5432 \
    DB_USERNAME=dbadmin \
    DB_PASSWORD="YourSecurePassword123!" \
    DB_DATABASE=bookmark_manager \
    JWT_SECRET="your-production-jwt-secret-change-this" \
    JWT_EXPIRATION=7d \
    LOG_LEVEL=info

# Get the app URL
az containerapp show \
  --name $CONTAINER_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --query properties.configuration.ingress.fqdn \
  -o tsv
```

### Step 9: Test Deployment

```bash
# Get the URL
APP_URL=$(az containerapp show --name $CONTAINER_APP_NAME --resource-group $RESOURCE_GROUP --query properties.configuration.ingress.fqdn -o tsv)

# Test the API
curl https://$APP_URL/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### Updating the App

```bash
# Build new version
docker build -t $ACR_NAME.azurecr.io/bookmark-api:v2 .
docker push $ACR_NAME.azurecr.io/bookmark-api:v2

# Update container app
az containerapp update \
  --name $CONTAINER_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --image $ACR_NAME.azurecr.io/bookmark-api:v2
```

---

## Option 2: Azure App Service with Docker

**Best for:** Simple deployment, integrated with Azure DevOps

### Quick Deploy

```bash
# Create App Service Plan
az appservice plan create \
  --name bookmark-plan \
  --resource-group $RESOURCE_GROUP \
  --is-linux \
  --sku B1

# Create Web App
az webapp create \
  --resource-group $RESOURCE_GROUP \
  --plan bookmark-plan \
  --name bookmark-api-app \
  --deployment-container-image-name $ACR_NAME.azurecr.io/bookmark-api:latest

# Configure container registry
az webapp config container set \
  --name bookmark-api-app \
  --resource-group $RESOURCE_GROUP \
  --docker-custom-image-name $ACR_NAME.azurecr.io/bookmark-api:latest \
  --docker-registry-server-url https://$ACR_NAME.azurecr.io \
  --docker-registry-server-user $ACR_USERNAME \
  --docker-registry-server-password $ACR_PASSWORD

# Set environment variables
az webapp config appsettings set \
  --resource-group $RESOURCE_GROUP \
  --name bookmark-api-app \
  --settings \
    NODE_ENV=production \
    PORT=3000 \
    DB_HOST=$DB_HOST \
    DB_PORT=5432 \
    DB_USERNAME=dbadmin \
    DB_PASSWORD="YourSecurePassword123!" \
    DB_DATABASE=bookmark_manager \
    JWT_SECRET="your-production-jwt-secret" \
    JWT_EXPIRATION=7d
```

---

## Cost Optimization Tips

### Container Apps

- Use **consumption plan** for variable workloads
- Set `--min-replicas 0` for dev/staging (scales to zero when idle)
- Use **Burstable tier** for PostgreSQL in dev/staging

### App Service

- Use **B1 tier** for development ($13/month)
- Use **P1V2 tier** for production ($73/month)
- Enable **auto-scaling** based on CPU/memory

### Database

- **Burstable B1ms**: ~$12/month (dev/staging)
- **General Purpose D2s_v3**: ~$140/month (production)
- Enable **automated backups** (included)

---

## Security Best Practices

### 1. Use Azure Key Vault for Secrets

```bash
# Create Key Vault
az keyvault create \
  --name bookmark-keyvault \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION

# Store secrets
az keyvault secret set \
  --vault-name bookmark-keyvault \
  --name db-password \
  --value "YourSecurePassword123!"

az keyvault secret set \
  --vault-name bookmark-keyvault \
  --name jwt-secret \
  --value "your-production-jwt-secret"
```

### 2. Configure Firewall Rules

```bash
# Allow only Azure services to access PostgreSQL
az postgres flexible-server firewall-rule create \
  --resource-group $RESOURCE_GROUP \
  --name bookmark-postgres \
  --rule-name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
```

### 3. Enable HTTPS Only

```bash
# Container Apps (HTTPS by default)
az containerapp ingress enable \
  --name $CONTAINER_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --type external \
  --allow-insecure false \
  --target-port 3000
```

---

## Monitoring and Logging

### Enable Application Insights

```bash
# Create Application Insights
az monitor app-insights component create \
  --app bookmark-insights \
  --location $LOCATION \
  --resource-group $RESOURCE_GROUP \
  --application-type Node.JS

# Get instrumentation key
INSTRUMENTATION_KEY=$(az monitor app-insights component show \
  --app bookmark-insights \
  --resource-group $RESOURCE_GROUP \
  --query instrumentationKey -o tsv)
```

### View Logs

```bash
# Container Apps logs
az containerapp logs show \
  --name $CONTAINER_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --follow

# App Service logs
az webapp log tail \
  --name bookmark-api-app \
  --resource-group $RESOURCE_GROUP
```

---

## Troubleshooting

### Container App Not Starting

```bash
# Check logs
az containerapp logs show \
  --name $CONTAINER_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --tail 100
```

### Database Connection Issues

```bash
# Test database connectivity
az postgres flexible-server connect \
  --name bookmark-postgres \
  --admin-user dbadmin
```

---

## Cleanup Resources

```bash
# Delete entire resource group (removes all resources)
az group delete \
  --name $RESOURCE_GROUP \
  --yes \
  --no-wait
```

---

## Additional Resources

- [Azure Container Apps Documentation](https://learn.microsoft.com/en-us/azure/container-apps/)
- [Azure Database for PostgreSQL](https://learn.microsoft.com/en-us/azure/postgresql/)
- [Azure Container Registry](https://learn.microsoft.com/en-us/azure/container-registry/)
- [Azure CLI Reference](https://learn.microsoft.com/en-us/cli/azure/)

---

**Your Bookmark Manager API is now ready for Azure deployment!** 🚀

Access your API at: `https://your-container-app-url.azurecontainerapps.io/v1`

Swagger docs: `https://your-container-app-url.azurecontainerapps.io/api/docs`
