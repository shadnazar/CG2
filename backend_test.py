import requests
import sys
from datetime import datetime
import json

class CelestaGlowAPITester:
    def __init__(self, base_url="https://face-serum-order.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.created_order_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}" if endpoint else f"{self.api_url}/"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)

            print(f"   Response Status: {response.status_code}")
            
            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)}")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error Response: {json.dumps(error_data, indent=2)}")
                except:
                    print(f"   Error Text: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test the root API endpoint"""
        success, response = self.run_test(
            "Root API Endpoint",
            "GET",
            "",
            200
        )
        if success and response.get('message') == 'Celesta Glow API':
            print("✅ Root endpoint returned correct message")
            return True
        else:
            print("❌ Root endpoint message incorrect")
            return False

    def test_create_order_prepaid(self):
        """Test creating a prepaid order"""
        order_data = {
            "name": "Test Customer",
            "phone": "9876543210",
            "address": "123 MG Road, Bangalore, Karnataka 560001",
            "payment_method": "PREPAID",
            "amount": 899.0
        }
        
        success, response = self.run_test(
            "Create Prepaid Order",
            "POST",
            "orders",
            200,
            data=order_data
        )
        
        if success:
            # Validate response structure
            required_fields = ['order_id', 'name', 'phone', 'address', 'payment_method', 'amount', 'delivery_timeline', 'status']
            missing_fields = [field for field in required_fields if field not in response]
            
            if missing_fields:
                print(f"❌ Missing fields in response: {missing_fields}")
                return False
            
            # Validate order_id format (CG followed by 6 digits)
            order_id = response.get('order_id', '')
            if not (order_id.startswith('CG') and len(order_id) == 8 and order_id[2:].isdigit()):
                print(f"❌ Invalid order_id format: {order_id}")
                return False
            
            # Validate delivery timeline for prepaid
            if response.get('delivery_timeline') != 'Fast Delivery (2-3 Days)':
                print(f"❌ Wrong delivery timeline for prepaid: {response.get('delivery_timeline')}")
                return False
            
            # Store order_id for later tests
            self.created_order_id = order_id
            print(f"✅ Order created successfully with ID: {order_id}")
            return True
        
        return False

    def test_create_order_cod(self):
        """Test creating a COD order"""
        order_data = {
            "name": "Test Customer COD",
            "phone": "9876543211",
            "address": "456 Brigade Road, Bangalore, Karnataka 560025",
            "payment_method": "COD",
            "amount": 1199.0
        }
        
        success, response = self.run_test(
            "Create COD Order",
            "POST",
            "orders",
            200,
            data=order_data
        )
        
        if success:
            # Validate delivery timeline for COD
            if response.get('delivery_timeline') != '5-7 Business Days':
                print(f"❌ Wrong delivery timeline for COD: {response.get('delivery_timeline')}")
                return False
            
            print(f"✅ COD Order created successfully with ID: {response.get('order_id')}")
            return True
        
        return False

    def test_get_order_by_id(self):
        """Test retrieving order by ID"""
        if not self.created_order_id:
            print("❌ No order ID available for testing")
            return False
        
        success, response = self.run_test(
            f"Get Order by ID ({self.created_order_id})",
            "GET",
            f"orders/{self.created_order_id}",
            200
        )
        
        if success:
            if response.get('order_id') == self.created_order_id:
                print(f"✅ Successfully retrieved order: {self.created_order_id}")
                return True
            else:
                print(f"❌ Retrieved wrong order ID: {response.get('order_id')}")
                return False
        
        return False

    def test_get_all_orders(self):
        """Test retrieving all orders"""
        success, response = self.run_test(
            "Get All Orders",
            "GET",
            "orders",
            200
        )
        
        if success:
            if isinstance(response, list):
                print(f"✅ Retrieved {len(response)} orders")
                return True
            else:
                print("❌ Response is not a list")
                return False
        
        return False

    def test_invalid_order_id(self):
        """Test retrieving non-existent order"""
        success, response = self.run_test(
            "Get Non-existent Order",
            "GET",
            "orders/CG999999",
            404
        )
        
        if success:
            print("✅ Correctly returned 404 for non-existent order")
            return True
        
        return False

def main():
    print("🚀 Starting Celesta Glow API Tests")
    print("=" * 50)
    
    # Setup
    tester = CelestaGlowAPITester()
    
    # Run all tests
    tests = [
        tester.test_root_endpoint,
        tester.test_create_order_prepaid,
        tester.test_create_order_cod,
        tester.test_get_order_by_id,
        tester.test_get_all_orders,
        tester.test_invalid_order_id
    ]
    
    for test in tests:
        try:
            test()
        except Exception as e:
            print(f"❌ Test failed with exception: {str(e)}")
            tester.tests_run += 1
    
    # Print results
    print("\n" + "=" * 50)
    print(f"📊 API Tests Summary:")
    print(f"   Tests Run: {tester.tests_run}")
    print(f"   Tests Passed: {tester.tests_passed}")
    print(f"   Success Rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All API tests passed!")
        return 0
    else:
        print("⚠️  Some API tests failed!")
        return 1

if __name__ == "__main__":
    sys.exit(main())