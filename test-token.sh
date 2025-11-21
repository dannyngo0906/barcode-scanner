#!/bin/bash
# Quick test script for NocoDB token

echo "🔍 Testing NocoDB Token Configuration..."
echo ""

# Load .env file
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
    echo "✅ Found .env file"
else
    echo "❌ .env file not found!"
    exit 1
fi

# Check if token is set
if [ -z "$NOCODB_TOKEN" ] || [ "$NOCODB_TOKEN" = "your_nocodb_token_here" ]; then
    echo "❌ Token is not configured!"
    echo ""
    echo "Please edit .env file and add your real token:"
    echo "NOCODB_TOKEN=nc_your_actual_token_here"
    exit 1
fi

echo "📋 Token configured: ${NOCODB_TOKEN:0:10}...${NOCODB_TOKEN: -8}"
echo ""

# Test API call
echo "⏳ Testing API with configured token..."
echo ""

RESPONSE=$(curl -s -w "\n%{http_code}" -H "xc-token: $NOCODB_TOKEN" \
    "https://db.salesai.vn/api/v2/tables/m3rrbw0dbrlqogw/records?offset=0&limit=1")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

echo "📥 HTTP Status: $HTTP_CODE"
echo ""

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ SUCCESS! API is working!"
    echo ""
    echo "📦 Response:"
    echo "$BODY" | head -c 500
    echo ""
    echo ""
    echo "🎉 Your token is valid and working!"
    echo "You can now start the server: npm run dev"
elif [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "403" ]; then
    echo "❌ AUTHENTICATION FAILED!"
    echo ""
    echo "Token is invalid or expired. Please:"
    echo "1. Login to https://db.salesai.vn"
    echo "2. Get a new token from Account Settings > API Tokens"
    echo "3. Update .env file with the new token"
elif [ "$HTTP_CODE" = "000" ]; then
    echo "❌ CONNECTION FAILED!"
    echo ""
    echo "Cannot connect to NocoDB server."
    echo "Please check:"
    echo "1. Network connection"
    echo "2. NocoDB server is running"
    echo "3. URL is correct: https://db.salesai.vn"
else
    echo "⚠️  Unexpected response:"
    echo "$BODY"
fi
