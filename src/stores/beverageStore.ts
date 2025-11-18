import { defineStore } from "pinia";
import {
  BaseBeverageType,
  CreamerType,
  SyrupType,
  BeverageType,
} from "../types/beverage";
import tempretures from "../data/tempretures.json";
import db from "../firebase.ts";
import {
  collection,
  getDocs,
  addDoc,
  getDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";

export const useBeverageStore = defineStore("BeverageStore", {
  state: () => ({
    temps: tempretures,
    currentTemp: tempretures[0],
    bases: [] as BaseBeverageType[],
    currentBase: null as BaseBeverageType | null,
    syrups: [] as SyrupType[],
    currentSyrup: null as SyrupType | null,
    creamers: [] as CreamerType[],
    currentCreamer: null as CreamerType | null,
    beverages: [] as BeverageType[],
    currentBeverage: null as BeverageType | null,
    currentName: "",
  }),

  actions: {
    async init() {
       // Fetch bases
      const basesSnap = await getDocs(collection(db, "bases"));
      this.bases = basesSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as BaseBeverageType[];

      // Fetch syrups
      const syrupsSnap = await getDocs(collection(db, "syrups"));
      this.syrups = syrupsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as SyrupType[];

      // Fetch creamers
      const creamersSnap = await getDocs(collection(db, "creamers"));
      this.creamers = creamersSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as CreamerType[];

      // Fetch beverages
      const beveragesSnap = await getDocs(collection(db, "beverages"));
      this.beverages = beveragesSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as BeverageType[];

      // Optionally set defaults
      this.currentBase = this.bases[0];
      this.currentSyrup = this.syrups[1];
      this.currentCreamer = this.creamers[1];
      this.currentBeverage = this.beverages[1];
    },

    async makeBeverage() {
      const newBeverage = {
        name: this.currentName || "Custom Beverage",
        base: this.currentBase,
        syrup: this.currentSyrup,
        creamer: this.currentCreamer,
        temp: this.currentTemp,
      };

      try {
        const docRef = await addDoc(collection(db, "beverages"), newBeverage);
        console.log("Beverage stored with ID:", docRef.id);
      } catch (e) {
        console.error("Error adding beverage:", e);
      }
    },

    async showBeverage(id: string) {
      try {
        const docRef = doc(db, "beverages", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const beverage = { id: docSnap.id, ...docSnap.data() } as BeverageType;
          this.currentTemp = beverage.temp;
          this.currentBase = beverage.base;
          this.currentCreamer = beverage.creamer;
          this.currentSyrup = beverage.syrup
          console.log("Selected beverage:", beverage);
        } else {
          console.error("No such beverage found!");
          this.currentBeverage = null;
        }
      } catch (e) {
        console.error("Error loading beverage:", e);
      }
    },

    listenToBeverages() {
      const beveragesRef = collection(db, "beverages");

      // Set up real-time listener
      onSnapshot(beveragesRef, (snapshot) => {
        this.beverages = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as BeverageType[];

        console.log("Realtime beverages:", this.beverages);
      });
    }
  },
});
