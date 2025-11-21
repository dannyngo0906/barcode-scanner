#!/bin/bash

TOKEN="1Owqe7hG7sV0V16DQCv_BPC0gUDLITp-_yRXvLGA"
BASE_URL="https://db.salesai.vn/api/v3/data/pc6dn5x2psu1vsz/m3rrbw0dbrlqogw/records"
BARCODE="769915233490"

echo "🔍 Testing NocoDB v3 WHERE Syntax..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo

# Test 1: v2 style (no quotes)
echo "1️⃣  v2 style: where=(barcode,eq,$BARCODE)"
WHERE1=$(printf "(barcode,eq,%s)" "$BARCODE" | jq -sRr @uri)
RESULT1=$(curl -s -w "\nHTTP_STATUS:%{http_code}\n" \
  -H "xc-token: $TOKEN" \
  "${BASE_URL}?where=${WHERE1}" | tail -2)
echo "$RESULT1"
echo

# Test 2: v3 style with quotes
echo "2️⃣  v3 style with quotes: where=(\"barcode\",eq,\"$BARCODE\")"
WHERE2=$(printf '("barcode",eq,"%s")' "$BARCODE" | jq -sRr @uri)
RESULT2=$(curl -s -w "\nHTTP_STATUS:%{http_code}\n" \
  -H "xc-token: $TOKEN" \
  "${BASE_URL}?where=${WHERE2}" | tail -2)
echo "$RESULT2"
echo

# Test 3: v3 with @ prefix
echo "3️⃣  v3 with @ prefix: where=@(\"barcode\",eq,\"$BARCODE\")"
WHERE3=$(printf '@("barcode",eq,"%s")' "$BARCODE" | jq -sRr @uri)
RESULT3=$(curl -s -w "\nHTTP_STATUS:%{http_code}\n" \
  -H "xc-token: $TOKEN" \
  "${BASE_URL}?where=${WHERE3}" | tail -2)
echo "$RESULT3"
echo

# Test 4: JSON filter
echo "4️⃣  JSON filter: filter={\"barcode\":\"$BARCODE\"}"
FILTER4=$(printf '{"barcode":"%s"}' "$BARCODE" | jq -sRr @uri)
RESULT4=$(curl -s -w "\nHTTP_STATUS:%{http_code}\n" \
  -H "xc-token: $TOKEN" \
  "${BASE_URL}?filter=${FILTER4}" | tail -2)
echo "$RESULT4"
echo

# Test 5: Simple equality
echo "5️⃣  Simple field: ?barcode=$BARCODE"
RESULT5=$(curl -s -w "\nHTTP_STATUS:%{http_code}\n" \
  -H "xc-token: $TOKEN" \
  "${BASE_URL}?barcode=${BARCODE}" | tail -2)
echo "$RESULT5"
echo

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo
echo "💡 Look for HTTP_STATUS:200 to find the working syntax!"
