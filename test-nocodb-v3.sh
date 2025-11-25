#!/bin/bash
# Test NocoDB v3 API with different query formats

TOKEN="$1"
BARCODE="${2:-8936186880060}"

if [ -z "$TOKEN" ]; then
    echo "Usage: ./test-nocodb-v3.sh <token> [barcode]"
    echo "Example: ./test-nocodb-v3.sh nc_your_token 8936186880060"
    exit 1
fi

BASE_URL="https://db.salesai.vn/api/v3/data/pc6dn5x2psu1vsz/m3rrbw0dbrlqogw/records"

echo "🔍 Testing NocoDB v3 API..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 1: Simple GET without filter
echo "📋 Test 1: GET all records (limit 1)"
echo "URL: ${BASE_URL}?limit=1"
echo ""
RESPONSE=$(curl -s -w "\nHTTP:%{http_code}" \
    -H "xc-token: ${TOKEN}" \
    -H "Content-Type: application/json" \
    "${BASE_URL}?limit=1")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1 | cut -d: -f2)
BODY=$(echo "$RESPONSE" | head -n-1)
echo "Status: $HTTP_CODE"
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ SUCCESS!"
    echo "$BODY" | head -c 300
else
    echo "❌ FAILED"
    echo "$BODY"
fi
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 2: v2 style where query
echo "📋 Test 2: v2 style where query"
WHERE=$(echo "(barcode,eq,${BARCODE})" | jq -sRr @uri)
echo "URL: ${BASE_URL}?where=${WHERE}"
echo ""
RESPONSE=$(curl -s -w "\nHTTP:%{http_code}" \
    -H "xc-token: ${TOKEN}" \
    -H "Content-Type: application/json" \
    "${BASE_URL}?where=${WHERE}&limit=25")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1 | cut -d: -f2)
BODY=$(echo "$RESPONSE" | head -n-1)
echo "Status: $HTTP_CODE"
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ SUCCESS!"
    echo "$BODY" | head -c 500
else
    echo "❌ FAILED"
    echo "$BODY"
fi
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 3: Try xc-auth header instead
echo "📋 Test 3: Using xc-auth header"
echo ""
RESPONSE=$(curl -s -w "\nHTTP:%{http_code}" \
    -H "xc-auth: ${TOKEN}" \
    -H "Content-Type: application/json" \
    "${BASE_URL}?limit=1")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1 | cut -d: -f2)
BODY=$(echo "$RESPONSE" | head -n-1)
echo "Status: $HTTP_CODE"
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ SUCCESS!"
    echo "$BODY" | head -c 300
else
    echo "❌ FAILED"
    echo "$BODY"
fi
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
echo "💡 Summary:"
echo "If all tests failed with 403, the token doesn't have permission for this base."
echo "Please create a new token specifically for base: pc6dn5x2psu1vsz"
