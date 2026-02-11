/**
 * ESP32 IoT Device - Kaspa Integration
 * 
 * This code runs on your ESP32 device
 * Connects to WiFi, reads button/sensor, sends HTTP request to backend
 * 
 * Hardware Setup:
 * - ESP32 board
 * - Button connected to GPIO 4 (with pull-up resistor)
 * - LED connected to GPIO 2 (built-in LED)
 * 
 * Think: This is the "delivery boy" that sends orders to the server
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// ═══════════════════════════════════════
// CONFIGURATION - CHANGE THESE
// ═══════════════════════════════════════

// WiFi credentials (Wokwi Simulator)
const char* ssid = "Wokwi-GUEST";
const char* password = "";

// Backend server URL (MUST BE PUBLIC URL)
// Deploy backend to Railway/Render/Vercel first, then update this URL
// Example: https://your-app.railway.app/api/trigger
const char* serverUrl = "https://YOUR-BACKEND-URL.railway.app/api/trigger";

// Device configuration
const char* deviceId = "door1";

// ═══════════════════════════════════════
// HARDWARE PINS
// ═══════════════════════════════════════

const int BUTTON_PIN = 4;    // Button input
const int LED_PIN = 2;       // Built-in LED
const int SENSOR_PIN = 34;   // Optional: analog sensor

// ═══════════════════════════════════════
// GLOBAL VARIABLES
// ═══════════════════════════════════════

bool lastButtonState = HIGH;
unsigned long lastDebounceTime = 0;
const unsigned long debounceDelay = 50;

void setup() {
  // Initialize serial communication
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("\n\n");
  Serial.println("═══════════════════════════════════════");
  Serial.println("🚀 ESP32 Kaspa IoT Device Starting");
  Serial.println("═══════════════════════════════════════");
  
  // Setup pins
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);
  
  // Connect to WiFi
  connectWiFi();
  
  Serial.println("\n✓ Device ready!");
  Serial.println("⏳ Waiting for button press...\n");
}

void loop() {
  // AUTO TRIGGER MODE (for Wokwi simulator testing)
  // Triggers automatically every 5 seconds
  // Perfect for testing backend without physical button
  
  Serial.println("\n🔘 Auto Trigger!");
  digitalWrite(LED_PIN, HIGH);
  
  // Send request to backend
  sendTriggerRequest("open", "auto_trigger");
  
  // Wait 5 seconds before next trigger
  delay(5000);
  digitalWrite(LED_PIN, LOW);
  delay(1000);
  
  // Note: For physical button, uncomment the code below and comment out above
  /*
  int buttonState = digitalRead(BUTTON_PIN);
  
  if (buttonState == LOW && lastButtonState == HIGH) {
    unsigned long currentTime = millis();
    
    if ((currentTime - lastDebounceTime) > debounceDelay) {
      lastDebounceTime = currentTime;
      
      Serial.println("\n🔘 Button Pressed!");
      digitalWrite(LED_PIN, HIGH);
      
      sendTriggerRequest("open", "button_pressed");
      
      delay(1000);
      digitalWrite(LED_PIN, LOW);
    }
  }
  
  lastButtonState = buttonState;
  delay(10);
  */
}

/**
 * Connect to WiFi
 */
void connectWiFi() {
  Serial.print("📡 Connecting to WiFi: ");
  Serial.println(ssid);
  
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✓ WiFi Connected!");
    Serial.print("📍 IP Address: ");
    Serial.println(WiFi.localIP());
    Serial.print("📶 Signal Strength: ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");
  } else {
    Serial.println("\n❌ WiFi Connection Failed!");
    Serial.println("⚠️  Check your WiFi credentials");
  }
}

/**
 * Send trigger request to backend server
 */
void sendTriggerRequest(const char* action, const char* sensor) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("❌ WiFi not connected!");
    return;
  }
  
  Serial.println("\n📤 Sending request to backend...");
  Serial.print("🔗 URL: ");
  Serial.println(serverUrl);
  
  HTTPClient http;
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");
  
  // Read sensor value (optional)
  int sensorValue = analogRead(SENSOR_PIN);
  
  // Create JSON payload
  StaticJsonDocument<256> doc;
  doc["device"] = deviceId;
  doc["action"] = action;
  doc["sensor"] = sensor;
  doc["data"]["sensorValue"] = sensorValue;
  doc["data"]["timestamp"] = millis();
  doc["data"]["rssi"] = WiFi.RSSI();
  
  String jsonPayload;
  serializeJson(doc, jsonPayload);
  
  Serial.println("📦 Payload:");
  Serial.println(jsonPayload);
  
  // Send POST request
  unsigned long startTime = millis();
  int httpResponseCode = http.POST(jsonPayload);
  unsigned long duration = millis() - startTime;
  
  // Handle response
  if (httpResponseCode > 0) {
    Serial.print("✓ Response Code: ");
    Serial.println(httpResponseCode);
    Serial.print("⏱️  Duration: ");
    Serial.print(duration);
    Serial.println(" ms");
    
    String response = http.getString();
    Serial.println("\n📥 Response:");
    Serial.println(response);
    
    // Parse response
    StaticJsonDocument<512> responseDoc;
    DeserializationError error = deserializeJson(responseDoc, response);
    
    if (!error) {
      bool success = responseDoc["success"];
      const char* status = responseDoc["ui"]["status"];
      const char* icon = responseDoc["ui"]["icon"];
      
      Serial.println("\n═══════════════════════════════════════");
      if (success) {
        Serial.print("✅ ");
        Serial.print(icon);
        Serial.print(" ");
        Serial.println(status);
        
        // Blink LED to show success
        blinkLED(3, 200);
      } else {
        Serial.print("❌ ");
        Serial.println(status);
        
        // Blink LED to show error
        blinkLED(5, 100);
      }
      Serial.println("═══════════════════════════════════════\n");
      
      // Print transaction details
      if (responseDoc.containsKey("data")) {
        const char* txId = responseDoc["data"]["txId"];
        const char* dataHash = responseDoc["data"]["dataHash"];
        float probability = responseDoc["data"]["probability"];
        
        Serial.println("📊 Transaction Details:");
        Serial.print("  TX ID: ");
        Serial.println(txId);
        Serial.print("  Hash: ");
        Serial.println(dataHash);
        Serial.print("  Probability: ");
        Serial.print(probability * 100);
        Serial.println("%");
      }
    }
  } else {
    Serial.print("❌ HTTP Error: ");
    Serial.println(httpResponseCode);
    Serial.println("⚠️  Check if backend server is running");
    
    // Blink LED to show error
    blinkLED(10, 50);
  }
  
  http.end();
  Serial.println("\n⏳ Waiting for next button press...\n");
}

/**
 * Blink LED
 */
void blinkLED(int times, int delayMs) {
  for (int i = 0; i < times; i++) {
    digitalWrite(LED_PIN, HIGH);
    delay(delayMs);
    digitalWrite(LED_PIN, LOW);
    delay(delayMs);
  }
}

/**
 * Read sensor data (example)
 */
float readTemperature() {
  // If you have a temperature sensor, read it here
  // For now, return a dummy value
  return 25.5;
}

float readHumidity() {
  // If you have a humidity sensor, read it here
  return 60.0;
}
