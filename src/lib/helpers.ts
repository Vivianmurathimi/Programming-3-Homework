// OOP: Core entity classes
export class Pet {
  id: number;
  name: string;
  type: string;
  adoptedBy: number | null;
  hunger: number;
  happiness: number;

  constructor(id: number, name: string, type: string, adoptedBy: number | null = null, hunger: number = 50, happiness: number = 0) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.adoptedBy = adoptedBy;
    this.hunger = hunger;
    this.happiness = happiness;
  }

  feed(amount: number = 20) {
    this.hunger = Math.max(0, this.hunger - amount);
  }

  play(amount: number = 30) {
    this.happiness = Math.min(100, this.happiness + amount);
  }

  returnPet() {
    this.adoptedBy = null;
    this.hunger = 50;
    this.happiness = 0;
  }
}

export class Puppy extends Pet {
  constructor(id: number, name: string, adoptedBy: number | null = null, hunger: number = 50, happiness: number = 0) {
    super(id, name, 'puppy', adoptedBy, hunger, happiness);
  }
  // Puppy-specific logic can go here
}

export class Kitten extends Pet {
  constructor(id: number, name: string, adoptedBy: number | null = null, hunger: number = 50, happiness: number = 0) {
    super(id, name, 'kitten', adoptedBy, hunger, happiness);
  }
  // Kitten-specific logic can go here
}

export class UserEntity {
  id: number;
  name: string;
  budget: number;
  inventory: { food: number; toy: number; treat: number };
  role: 'user' | 'admin';

  constructor(id: number, name: string, budget: number = 0, inventory = { food: 0, toy: 0, treat: 0 }, role: 'user' | 'admin' = 'user') {
    this.id = id;
    this.name = name;
    this.budget = budget;
    this.inventory = inventory;
    this.role = role;
  }

  canAfford(cost: number) {
    return this.budget >= cost;
  }

  spend(cost: number) {
    if (this.canAfford(cost)) {
      this.budget -= cost;
      return true;
    }
    return false;
  }

  addItem(item: keyof typeof this.inventory) {
    this.inventory[item]++;
  }

  useItem(item: keyof typeof this.inventory) {
    if (this.inventory[item] > 0) {
      this.inventory[item]--;
      return true;
    }
    return false;
  }
}
