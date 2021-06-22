package com.example.issuer;

import com.google.gson.Gson;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.crypto.BadPaddingException;
import javax.crypto.Cipher;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.NoSuchPaddingException;
import java.security.*;
import java.util.Arrays;
import java.util.Collections;


@SpringBootApplication
@RestController
public class DemoApplication {

    public static void main(String[] args) {
        SpringApplication app = new SpringApplication(DemoApplication.class);
        app.setDefaultProperties(Collections.singletonMap("server.port", 8083));
        //SpringApplication.run(DemoApplication.class, args);
        app.run(args);

    }

    @GetMapping("/hello")
    public String hello(@RequestParam(value = "name", defaultValue = "World") String name) {
        Credential credential = new Credential("name", "Over 18 år");
        KeySaver keySaver = new KeySaver(credential);
        JsonHandler jsonHandler = new JsonHandler();
        jsonHandler.saveKeysaverToJson(keySaver);

        return String.format("Hello %s!", name);

    }

    @GetMapping("/keys")
    public String keys(@RequestParam(value = "key", defaultValue = "deafult") String name) throws NoSuchAlgorithmException, NoSuchPaddingException, IllegalBlockSizeException, BadPaddingException, InvalidKeyException {
        KeyGenerator keyGen = new KeyGenerator();
        Signing signing = new Signing();
        Credential credential = new Credential("Digdir", "Over 18 år");
        byte[] signature = signing.sign(keyGen.getPrivateKey(), credential);
        boolean res = decryptSignature(signature, keyGen.getPublicKey(), credential);

        //return String.format("Public Key: %s/n Private key: %s",keyGen.getPublicKey(), keyGen.getPrivateKey());
        //return String.format("Public Key: %s Private key: %s",keyGen.getMOCKPublicKey(), keyGen.getMOCKPrivateKey());
        return String.format("Decryption result:    %s ",res);

    }

    @GetMapping("/api/key/{id}")
    public String api(@PathVariable String id) {
        FileHandler fileHandler = new FileHandler();
        try{
           String publicKeyString = fileHandler.getPublicKeyAsString(id);
           return publicKeyString;
        }catch (Exception e){
            System.out.println("No key found.");
            return "No key found with this id";
        }
    }




    public boolean decryptSignature(byte[] signature, PublicKey publicKey, Credential message) throws NoSuchPaddingException, NoSuchAlgorithmException, InvalidKeyException, IllegalBlockSizeException, BadPaddingException {

        Cipher cipher = Cipher.getInstance("RSA");
        cipher.init(Cipher.DECRYPT_MODE, publicKey);
        byte[] decryptedMessageHash = cipher.doFinal(signature);

        byte[] messageBytes = message.stringifier().getBytes();
        MessageDigest md = MessageDigest.getInstance("SHA-256");
        byte[] messageHash = md.digest(messageBytes);

        return Arrays.equals(decryptedMessageHash, messageHash);
    }

}