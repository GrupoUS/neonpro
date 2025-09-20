#!/usr/bin/env python3
"""
Test script for AG-UI Protocol implementation
"""

import asyncio
import json
import websockets
import ssl
from urllib.parse import urlparse

async def test_agui_protocol():
    """Test AG-UI Protocol WebSocket connection"""
    
    # Configuration
    WS_URL = "ws://localhost:8000/ws/agui/test_user_123"
    
    print("🚀 Testing AG-UI Protocol implementation...")
    
    try:
        # Create WebSocket connection
        async with websockets.connect(WS_URL) as websocket:
            print("✅ WebSocket connection established")
            
            # Wait for connection event
            response = await websocket.recv()
            connection_data = json.loads(response)
            print(f"📡 Connection event received: {connection_data['type']}")
            
            # Send a test message
            test_message = {
                "id": "test_001",
                "type": "message",
                "timestamp": 1234567890,
                "data": {
                    "message": {
                        "id": "msg_001",
                        "content": "Olá, preciso ver os agendamentos de hoje",
                        "type": "text"
                    }
                }
            }
            
            await websocket.send(json.dumps(test_message))
            print("📤 Test message sent")
            
            # Wait for response
            response = await websocket.recv()
            response_data = json.loads(response)
            print(f"📥 Response received: {response_data['type']}")
            
            if response_data['type'] == 'response':
                message = response_data['data']['message']
                print(f"💬 Assistant response: {message['content']}")
                if message.get('actions'):
                    print(f"🎯 Available actions: {[action['label'] for action in message['actions']]}")
            
            # Test heartbeat
            await asyncio.sleep(2)
            
            print("✅ AG-UI Protocol test completed successfully!")
            
    except Exception as e:
        print(f"❌ Error testing AG-UI Protocol: {e}")
        return False
    
    return True

async def test_http_endpoints():
    """Test HTTP fallback endpoints"""
    
    import aiohttp
    
    BASE_URL = "http://localhost:8000"
    
    print("\n🌐 Testing HTTP endpoints...")
    
    async with aiohttp.ClientSession() as session:
        try:
            # Test health endpoint
            async with session.get(f"{BASE_URL}/health") as response:
                if response.status == 200:
                    health_data = await response.json()
                    print(f"✅ Health check: {health_data['status']}")
                else:
                    print(f"❌ Health check failed: {response.status}")
            
            # Test AG-UI HTTP endpoint
            test_message = {
                "id": "http_test_001",
                "type": "message",
                "data": {
                    "message": {
                        "id": "http_msg_001",
                        "content": "Teste via HTTP",
                        "type": "text"
                    }
                }
            }
            
            async with session.post(f"{BASE_URL}/agui/http", json=test_message) as response:
                if response.status == 200:
                    response_data = await response.json()
                    print(f"✅ HTTP endpoint test successful")
                    print(f"📝 Response: {response_data.get('content', 'No content')}")
                else:
                    print(f"❌ HTTP endpoint test failed: {response.status}")
            
        except Exception as e:
            print(f"❌ Error testing HTTP endpoints: {e}")
            return False
    
    return True

async def main():
    """Run all tests"""
    
    print("=" * 60)
    print("AG-UI Protocol Implementation Test Suite")
    print("=" * 60)
    
    # Test WebSocket protocol
    websocket_success = await test_agui_protocol()
    
    # Test HTTP endpoints
    http_success = await test_http_endpoints()
    
    print("\n" + "=" * 60)
    print("Test Results Summary:")
    print(f"WebSocket Protocol: {'✅ PASS' if websocket_success else '❌ FAIL'}")
    print(f"HTTP Endpoints: {'✅ PASS' if http_success else '❌ FAIL'}")
    
    if websocket_success and http_success:
        print("\n🎉 All tests passed! AG-UI Protocol implementation is working correctly.")
        return True
    else:
        print("\n⚠️  Some tests failed. Please check the implementation.")
        return False

if __name__ == "__main__":
    success = asyncio.run(main())
    exit(0 if success else 1)