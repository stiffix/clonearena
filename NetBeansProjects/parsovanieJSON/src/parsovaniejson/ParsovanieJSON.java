/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package parsovaniejson;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import javax.json.Json;
import javax.json.JsonArray;
import javax.json.JsonObject;
import javax.json.JsonReader;
import javax.json.stream.JsonParser;
import javax.json.stream.JsonParser.Event;

/**
 *
 * @author Stiffix
 */
public class ParsovanieJSON {
    static String pathToJson = "jsony/testjson.json";
    
    public static void main(String[] args) {
        try {
            // Test method
            readJsonUsingStreamingApi();
            readJsonUsingObjectModelApi(false);
        } catch (Exception e) {
            e.printStackTrace();
        }
        
    }
    
    public static void readJsonUsingStreamingApi() throws FileNotFoundException, IOException {
        // Init
        InputStream in = new FileInputStream(new File(pathToJson));
        JsonParser parser = Json.createParser(in);
        Event event;
        
        // Format
        String result = "";
        String space = "";
        
        while (parser.hasNext()) {
            event = parser.next();
            switch (event) {
                case START_ARRAY:
                    space += "   ";
                    result += "[";
                    //result += "[ // Start Array";
                    break;
                case START_OBJECT:
                    space += "   ";
                    result += "{";
                    //result += "{ // Start Object";
                    break;
                case KEY_NAME:
                    result += parser.getString() + " : ";
                    break;
                case VALUE_STRING:
                    result += parser.getString();
                    break;
                case VALUE_NUMBER:
                    result += parser.getLong();
                    break;
                case VALUE_TRUE:
                    result += "true";
                    break;
                case VALUE_FALSE:
                    result += "false";
                    break;
                case VALUE_NULL:
                    result += "null";
                    break;
                case END_OBJECT:
                    result = result.substring(0, result.length() - 3);
                    //result += "} // End Object";
                    result += "}";
                    space = space.substring(0, space.length() - 3);
                    break;
                case END_ARRAY:
                    result = result.substring(0, result.length() - 3);
                    //result += "] // End Array";
                    result += "]";
                    space = space.substring(0, space.length() - 3);
                    break;
                default:
                    throw new AssertionError(event.name());
            }
            
            // New line
            if (event != Event.KEY_NAME) {
                result += '\n';
                result += space;
            }
        }
        
        in.close();
        
        System.out.println(result);
        
    }
    
    public static void readJsonUsingObjectModelApi(boolean test) throws FileNotFoundException {
        InputStream in = new FileInputStream(new File(pathToJson));
        JsonReader jreader = Json.createReader(in);
        
        String dataValue = "topping";
        String resultString = "";
        
        JsonObject obj = jreader.readObject();
        
        System.out.println("JSON FILE:");
        System.out.println(obj.toString());
        
        
        // Specific values of object - JUST FOR TEST
        if (test) {
            System.out.println("-------------------------");
            System.out.println("Just for TEST: OBJECT = " + dataValue + " -> id & type");
            JsonArray results = obj.getJsonArray(dataValue);
            for (JsonObject result : results.getValuesAs(JsonObject.class)) {
                resultString += "id: " + result.getString("id") + " | ";
                resultString += "type: " + result.getString("type") + '\n';
            }
            
        }
        
        System.out.println(resultString);
    }
    
}
