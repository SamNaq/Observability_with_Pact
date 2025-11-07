#!/bin/bash

# Script to kill processes using ports 3000 and 3001

echo "🔍 Checking for processes on ports 3000 and 3001..."

# Kill process on port 3000
PID_3000=$(lsof -ti:3000 2>/dev/null)
if [ ! -z "$PID_3000" ]; then
  echo "⚠️  Killing process $PID_3000 on port 3000"
  kill -9 $PID_3000 2>/dev/null
  echo "✅ Port 3000 is now free"
else
  echo "✅ Port 3000 is free"
fi

# Kill process on port 3001
PID_3001=$(lsof -ti:3001 2>/dev/null)
if [ ! -z "$PID_3001" ]; then
  echo "⚠️  Killing process $PID_3001 on port 3001"
  kill -9 $PID_3001 2>/dev/null
  echo "✅ Port 3001 is now free"
else
  echo "✅ Port 3001 is free"
fi

echo ""
echo "🚀 You can now start your services:"
echo "   npm run dev:provider"
echo "   npm run dev:consumer"



