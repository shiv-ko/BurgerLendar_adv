import React, { useEffect, useState } from "react";
import Unity, { UnityContext } from "react-unity-webgl";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";

interface BurgerConfig {
  includeMeatCount: number;
  includeCheeseCount: number;
  includeTomatoCount: number;
  includeLettuceCount: number;
}

function Webgl() {
  const [burgerConfig, setBurgerConfig] = useState<BurgerConfig>({
    includeMeatCount: 6,
    includeCheeseCount: 2,
    includeTomatoCount: 2,
    includeLettuceCount: 2,
  });

  const unityContext = new UnityContext({
    loaderUrl: "unity/hamberger.loader.js",
    dataUrl: "unity/hamberger.data",
    frameworkUrl: "unity/hamberger.framework.js",
    codeUrl: "unity/hamberger.wasm",
  });

  useEffect(() => {
    const auth = getAuth();
    const db = getFirestore();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userId = user.uid;
        const today = new Date();
        const yy = String(today.getFullYear()).slice(-2);
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const dd = String(today.getDate()).padStart(2, "0");
        const yymmdd = `${yy}${mm}${dd}`;
        const docRef = doc(db, "Users_Burger", userId, "BurgerData", yymmdd);

        try {
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data() as BurgerConfig;
            console.log("Fetched BurgerConfig: ", data);
            setBurgerConfig(data);
          } else {
            console.log("No data available");
          }
        } catch (error) {
          console.error("Error fetching burger config: ", error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    unityContext.on("loaded", () => {
      try {
        console.log("Unity loaded. Sending config: ", burgerConfig);
        unityContext.send("Scripts", "ConfigureBurger", JSON.stringify(burgerConfig));
      } catch (error) {
        console.error("Error sending config to Unity: ", error);
      }
    });
  }, [unityContext, burgerConfig]);

  useEffect(() => {
    unityContext.on("BurgerConfigured", (message) => {
      console.log("Burger configured: ", message);
    });

    return () => {
      unityContext.removeAllEventListeners();
    };
  }, [unityContext]);

  return (
    <div style={{ position: "relative" }}>
      <Unity unityContext={unityContext} style={{ width: 1240, height: 1240 }} />
    </div>
  );
}

export default Webgl;
