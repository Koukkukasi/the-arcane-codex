#!/bin/bash
# Authentication API Manual Testing Script
# This script demonstrates how to test all authentication endpoints

BASE_URL="http://localhost:5000/api/auth"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Authentication API Test Script ===${NC}\n"

# Generate random username to avoid conflicts
USERNAME="testuser_$(date +%s)"
PASSWORD="testpass123"
EMAIL="${USERNAME}@test.com"

echo -e "${BLUE}1. Testing Registration${NC}"
echo "POST $BASE_URL/register"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"$USERNAME\",
    \"password\": \"$PASSWORD\",
    \"email\": \"$EMAIL\"
  }")

echo "$REGISTER_RESPONSE" | jq '.'

# Extract tokens
ACCESS_TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.accessToken')
REFRESH_TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.refreshToken')

if [ "$ACCESS_TOKEN" != "null" ]; then
  echo -e "${GREEN}✓ Registration successful${NC}\n"
else
  echo -e "${RED}✗ Registration failed${NC}\n"
  exit 1
fi

sleep 1

echo -e "${BLUE}2. Testing Get User Info (with token)${NC}"
echo "GET $BASE_URL/me"
ME_RESPONSE=$(curl -s -X GET "$BASE_URL/me" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

echo "$ME_RESPONSE" | jq '.'

if [ "$(echo "$ME_RESPONSE" | jq -r '.success')" == "true" ]; then
  echo -e "${GREEN}✓ Get user info successful${NC}\n"
else
  echo -e "${RED}✗ Get user info failed${NC}\n"
fi

sleep 1

echo -e "${BLUE}3. Testing Token Refresh${NC}"
echo "POST $BASE_URL/refresh"
REFRESH_RESPONSE=$(curl -s -X POST "$BASE_URL/refresh" \
  -H "Content-Type: application/json" \
  -d "{
    \"refreshToken\": \"$REFRESH_TOKEN\"
  }")

echo "$REFRESH_RESPONSE" | jq '.'

NEW_ACCESS_TOKEN=$(echo "$REFRESH_RESPONSE" | jq -r '.accessToken')

if [ "$NEW_ACCESS_TOKEN" != "null" ]; then
  echo -e "${GREEN}✓ Token refresh successful${NC}\n"
  ACCESS_TOKEN="$NEW_ACCESS_TOKEN"
else
  echo -e "${RED}✗ Token refresh failed${NC}\n"
fi

sleep 1

echo -e "${BLUE}4. Testing Login${NC}"
echo "POST $BASE_URL/login"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"$USERNAME\",
    \"password\": \"$PASSWORD\"
  }")

echo "$LOGIN_RESPONSE" | jq '.'

if [ "$(echo "$LOGIN_RESPONSE" | jq -r '.success')" == "true" ]; then
  echo -e "${GREEN}✓ Login successful${NC}\n"
else
  echo -e "${RED}✗ Login failed${NC}\n"
fi

sleep 1

echo -e "${BLUE}5. Testing Logout${NC}"
echo "POST $BASE_URL/logout"
LOGOUT_RESPONSE=$(curl -s -X POST "$BASE_URL/logout" \
  -H "Content-Type: application/json" \
  -d "{
    \"refreshToken\": \"$REFRESH_TOKEN\"
  }")

echo "$LOGOUT_RESPONSE" | jq '.'

if [ "$(echo "$LOGOUT_RESPONSE" | jq -r '.success')" == "true" ]; then
  echo -e "${GREEN}✓ Logout successful${NC}\n"
else
  echo -e "${RED}✗ Logout failed${NC}\n"
fi

sleep 1

echo -e "${BLUE}6. Testing Refresh with Revoked Token (should fail)${NC}"
echo "POST $BASE_URL/refresh"
REVOKED_REFRESH_RESPONSE=$(curl -s -X POST "$BASE_URL/refresh" \
  -H "Content-Type: application/json" \
  -d "{
    \"refreshToken\": \"$REFRESH_TOKEN\"
  }")

echo "$REVOKED_REFRESH_RESPONSE" | jq '.'

if [ "$(echo "$REVOKED_REFRESH_RESPONSE" | jq -r '.success')" == "false" ]; then
  echo -e "${GREEN}✓ Revoked token correctly rejected${NC}\n"
else
  echo -e "${RED}✗ Revoked token was not rejected${NC}\n"
fi

echo -e "${BLUE}=== Test Complete ===${NC}"
echo -e "Test user: ${USERNAME}"
