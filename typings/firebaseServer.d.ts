declare module 'firebaseServer' {
  
  interface firebaseServer {
    (config: FirebaseServiceConfig);
  }

  interface FirebaseServiceConfig {
    url: String;
    port: Number;
    data: Object;
  }
  
  export = firebaseServer;
  
}