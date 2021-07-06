package com.example.issuer;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.RSAKeyProvider;
import org.json.JSONException;

import java.security.NoSuchAlgorithmException;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.util.Base64;
import java.util.Date;
import java.util.UUID;

public class Jwt {
    private String token;
    // makes current time issuance date and sets expiration date to two weeks.
    private Date issuedAt;
    private Date expiresAt;

    /**
     * Class for creating and signing a jwt for use as a verifiable credential with a holder.
     * Is verifiable because the public key is stored for later use in the VDR.
     *
     *
     * If you want to test this by sys.outing, remember to get the public key encoded as base64
     * and on jwt.io remember to start the public key with "-----BEGIN PUBLIC KEY-----",
     * end with "-----END PUBLIC KEY-----"
     *
     *
     * @param subjectId = whom the token refers to
     * @param issuerId = who creates and signs this token
     * @param vcType = type of credential
     * @param claimType = type of credentialSubject i.e. age, degree
     * @param type = type of claimType i.e. over-18, over-20
     * @param name = human-readable name i.e. Over 18, Over 20
     */
    public Jwt(String subjectId, String issuerId, String vcType, String claimType, String type, String name)  {
        this.issuedAt = new Date();
        this.expiresAt = new Date(issuedAt.getTime() + 1209600000);
        this.token = constructJwt(subjectId, issuerId, vcType, claimType, type, name);

    }


    public Jwt(String subjectId, String issuerId, String vcType, String claimType, String type, String name, long expOffset) {
        this.issuedAt = new Date();
        this.expiresAt = new Date(issuedAt.getTime() + expOffset);
        this.token = constructJwt(subjectId, issuerId, vcType, claimType, type,name);
    }
    /**
     * @param subjectId = whom the token refers to
     * @param issuerId = who creates and signs this token
     * @param vcType = type of credential
     * @param claimType = type of credentialSubject i.e. age, degree
     * @param type = type of claimType i.e. over-18, over-20
     * @param name = human-readable name i.e. Over 18, Over 20
     */
    private String constructJwt(String subjectId, String issuerId, String vcType, String claimType, String type, String name) {
        // Uses input parameters to create a credential subject.
        CredentialSubject credentialSubject = new CredentialSubject(claimType, type, name);
        // Uses input to create a verifiable credential.
        VC vc = new VC(vcType, credentialSubject.getCredentialSubjectAsMap());


        // Generates keypair - Private & Public
        KeyGenerator keyGen = null;
        try {
            keyGen = new KeyGenerator();
        } catch (NoSuchAlgorithmException e) {
            System.out.printf("%s ... There was an error in Jwt, NoSuchAlgorithm exception thrown%n", e.getMessage());
        }

        if (keyGen == null) {
            throw new NullPointerException("Keypair not created");
        }
        RSAPublicKey rsaPublicKey = (RSAPublicKey) keyGen.getPublicKey();
        RSAPrivateKey rsaPrivateKey = (RSAPrivateKey) keyGen.getPrivateKey();

        // Saves Public key to the VDR
        FileHandler fileHandler = new FileHandler();
        fileHandler.addPublicKey(issuerId + UUID.randomUUID(), rsaPublicKey);

        System.out.println(Base64.getEncoder().encodeToString(rsaPublicKey.getEncoded()));
        // Creates JWT based on public & private keypair. Standard naming is used when possible.
        Algorithm algorithm = Algorithm.RSA256(null,rsaPrivateKey);

        return token = JWT.create()
                .withIssuer(issuerId)
                .withIssuedAt(issuedAt)
                .withExpiresAt(expiresAt)
                .withJWTId("http://localhost:8083/credentials/1")
                .withSubject(subjectId)
                .withClaim("vc", vc.getVCMap())
                .sign(algorithm);
    }
    // Returns the instantiated JWT.
    public String getToken() {
        return token;
    }


    public static void main(String[] args) throws JSONException {
        Jwt jwt = new Jwt("testSub", "testIss", "AgeCredential", "age", "over-18","Over 18");
        System.out.println(jwt.getToken());
        long lo = 9999999999999L;
        Jwt jwt1 = new Jwt("testSub", "testIss", "AgeCredential", "age", "over-18", "Over 18", lo);
        System.out.println(jwt1.getToken());
    }
}
