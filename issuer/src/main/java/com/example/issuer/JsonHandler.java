package com.example.issuer;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import java.io.FileWriter;
import java.io.IOException;
import java.io.Reader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;

public class JsonHandler {
   // public KeySaver keySaver;
   private static FileWriter file;

    public JsonHandler(){

    }


    public void saveKeysaverToJson(KeySaver keySaver){
        //ArrayList<KeySaver> list = new ArrayList<>();
        Gson gson = new GsonBuilder().setPrettyPrinting().create();
        try {


        // create a reader
        Reader reader = Files.newBufferedReader(Path.of("C:\\Users\\camp-jhv\\IdeaProjects\\digdir-camp-2021-VC\\issuer\\src\\main\\resources\\IssuerPK.json"));

        //list = gson.fromJson(reader, ArrayList.class);
        KeySaver keySaverTest = gson.fromJson(reader, KeySaver.class);
        System.out.println(keySaverTest.id);
        //list.forEach(x -> System.out.println(x));

        } catch (IOException e) {
            e.printStackTrace();
        }

        // convert JSON file to map



        String json = gson.toJson(keySaver);

        try {

            // Constructs a FileWriter given a file name, using the platform's default charset
            file = new FileWriter("C:\\Users\\camp-jhv\\IdeaProjects\\digdir-camp-2021-VC\\issuer\\src\\main\\resources\\IssuerPK.json", true);
            file.append(json);
            // file.toString();
        } catch (IOException e) {
            e.printStackTrace();

        } finally {
            try {
                file.flush();
                file.close();
            } catch (IOException e) {
                // TODO Auto-generated catch block
                e.printStackTrace();
            }
        }
    }

    // Save json map to json file
    public void saveToFile(KeySaver keySaver) {
        Gson gson = new GsonBuilder().setPrettyPrinting().create();
        Map<String, String> map = readFile();
        map.put(keySaver.id,keySaver.pk);
        try {
            file = new FileWriter("C:\\Users\\camp-mib\\didir-ssi-project\\issuer\\src\\main\\resources\\IssuerPK.json");
            file.write(gson.toJson(map));
            file.flush();
            file.close();
        } catch (Exception e) {
            System.out.println("Error in saveToFile function, trying to write to file");
        }
    }

    // Read json object as a map
    public Map<String,String> readFile() {
        try {
            // Create new Gson instance
            Gson gson = new Gson();
            // Create a reader, reading from IssuerP(ublic)K(ey).json
            Reader reader = Files.newBufferedReader(Paths.get("src/main/resources/IssuerPK.json"));
            // file only has two values, equal to a map.
            Map<String, String> map = gson.fromJson(reader, Map.class);

            // Closing reader
            reader.close();
            return map;
        }
        // General exception handler
        catch (Exception e) {
            System.out.println("Something went wrong reading from file");
        }
        return null;
    }
}
