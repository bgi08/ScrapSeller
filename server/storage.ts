import { 
  users, materialCategories, pickupOrders, agentLocations, orderStatusHistory,
  type User, type InsertUser, type MaterialCategory, type InsertMaterialCategory,
  type PickupOrder, type InsertPickupOrder, type AgentLocation, type InsertAgentLocation,
  type OrderStatusHistory, type InsertOrderStatusHistory
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  getAgents(): Promise<User[]>;

  // Material Categories
  getMaterialCategories(): Promise<MaterialCategory[]>;
  createMaterialCategory(category: InsertMaterialCategory): Promise<MaterialCategory>;

  // Pickup Orders
  getPickupOrder(id: number): Promise<PickupOrder | undefined>;
  getOrdersByCustomer(customerId: number): Promise<PickupOrder[]>;
  getOrdersByAgent(agentId: number): Promise<PickupOrder[]>;
  createPickupOrder(order: InsertPickupOrder): Promise<PickupOrder>;
  updatePickupOrder(id: number, updates: Partial<PickupOrder>): Promise<PickupOrder | undefined>;
  getActiveOrders(): Promise<PickupOrder[]>;

  // Agent Locations
  getAgentLocation(agentId: number): Promise<AgentLocation | undefined>;
  updateAgentLocation(location: InsertAgentLocation): Promise<AgentLocation>;
  getAvailableAgents(): Promise<AgentLocation[]>;

  // Order Status History
  addOrderStatusHistory(history: InsertOrderStatusHistory): Promise<OrderStatusHistory>;
  getOrderStatusHistory(orderId: number): Promise<OrderStatusHistory[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private materialCategories: Map<number, MaterialCategory>;
  private pickupOrders: Map<number, PickupOrder>;
  private agentLocations: Map<number, AgentLocation>;
  private orderStatusHistory: Map<number, OrderStatusHistory>;
  private currentUserId: number;
  private currentCategoryId: number;
  private currentOrderId: number;
  private currentLocationId: number;
  private currentHistoryId: number;

  constructor() {
    this.users = new Map();
    this.materialCategories = new Map();
    this.pickupOrders = new Map();
    this.agentLocations = new Map();
    this.orderStatusHistory = new Map();
    this.currentUserId = 1;
    this.currentCategoryId = 1;
    this.currentOrderId = 1;
    this.currentLocationId = 1;
    this.currentHistoryId = 1;

    this.initializeData();
  }

  private initializeData() {
    // Create sample customer
    const customer: User = {
      id: this.currentUserId++,
      username: "customer1",
      password: "password123",
      name: "John Doe",
      phone: "+91 9876543210",
      address: "123 HSR Layout, Sector 7, Bangalore, Karnataka 560102",
      userType: "customer",
      isActive: true,
      rating: "4.5",
      totalPickups: 18,
    };
    this.users.set(customer.id, customer);

    // Create sample agents
    const agent1: User = {
      id: this.currentUserId++,
      username: "agent1",
      password: "password123",
      name: "Rajesh Kumar",
      phone: "+91 9876543211",
      address: "Agent Location 1",
      userType: "agent",
      isActive: true,
      rating: "4.8",
      totalPickups: 234,
    };
    this.users.set(agent1.id, agent1);

    const agent2: User = {
      id: this.currentUserId++,
      username: "agent2",
      password: "password123",
      name: "Amit Singh",
      phone: "+91 9876543212",
      address: "Agent Location 2",
      userType: "agent",
      isActive: true,
      rating: "4.6",
      totalPickups: 189,
    };
    this.users.set(agent2.id, agent2);

    // Create material categories
    const categories: InsertMaterialCategory[] = [
      {
        name: "Newspapers",
        description: "Old papers, magazines",
        ratePerKg: "12.00",
        icon: "fas fa-newspaper",
        color: "orange",
        isActive: true,
      },
      {
        name: "Iron & Steel",
        description: "Metals, equipment",
        ratePerKg: "45.00",
        icon: "fas fa-tools",
        color: "gray",
        isActive: true,
      },
      {
        name: "Plastic",
        description: "Bottles, containers",
        ratePerKg: "8.00",
        icon: "fas fa-wine-bottle",
        color: "blue",
        isActive: true,
      },
      {
        name: "Electronics",
        description: "Gadgets, wires",
        ratePerKg: "85.00",
        icon: "fas fa-microchip",
        color: "yellow",
        isActive: true,
      },
    ];

    categories.forEach(category => {
      const materialCategory: MaterialCategory = {
        id: this.currentCategoryId++,
        ...category,
      };
      this.materialCategories.set(materialCategory.id, materialCategory);
    });

    // Create agent locations
    const location1: AgentLocation = {
      id: this.currentLocationId++,
      agentId: agent1.id,
      latitude: "12.9141",
      longitude: "77.6321",
      isAvailable: true,
      updatedAt: new Date(),
    };
    this.agentLocations.set(location1.id, location1);

    const location2: AgentLocation = {
      id: this.currentLocationId++,
      agentId: agent2.id,
      latitude: "12.9200",
      longitude: "77.6400",
      isAvailable: true,
      updatedAt: new Date(),
    };
    this.agentLocations.set(location2.id, location2);
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      id: this.currentUserId++,
      rating: "0.00",
      totalPickups: 0,
      ...insertUser,
    };
    this.users.set(user.id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getAgents(): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.userType === "agent");
  }

  // Material Categories
  async getMaterialCategories(): Promise<MaterialCategory[]> {
    return Array.from(this.materialCategories.values()).filter(category => category.isActive);
  }

  async createMaterialCategory(insertCategory: InsertMaterialCategory): Promise<MaterialCategory> {
    const category: MaterialCategory = {
      id: this.currentCategoryId++,
      ...insertCategory,
    };
    this.materialCategories.set(category.id, category);
    return category;
  }

  // Pickup Orders
  async getPickupOrder(id: number): Promise<PickupOrder | undefined> {
    return this.pickupOrders.get(id);
  }

  async getOrdersByCustomer(customerId: number): Promise<PickupOrder[]> {
    return Array.from(this.pickupOrders.values())
      .filter(order => order.customerId === customerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getOrdersByAgent(agentId: number): Promise<PickupOrder[]> {
    return Array.from(this.pickupOrders.values())
      .filter(order => order.agentId === agentId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createPickupOrder(insertOrder: InsertPickupOrder): Promise<PickupOrder> {
    const order: PickupOrder = {
      id: this.currentOrderId++,
      agentId: null,
      actualWeight: null,
      actualEarning: null,
      completedAt: null,
      createdAt: new Date(),
      ...insertOrder,
    };
    this.pickupOrders.set(order.id, order);
    
    // Add initial status history
    await this.addOrderStatusHistory({
      orderId: order.id,
      status: "pending",
      notes: "Order created",
    });
    
    return order;
  }

  async updatePickupOrder(id: number, updates: Partial<PickupOrder>): Promise<PickupOrder | undefined> {
    const order = this.pickupOrders.get(id);
    if (!order) return undefined;
    
    const updatedOrder = { ...order, ...updates };
    this.pickupOrders.set(id, updatedOrder);
    
    // Add status history if status changed
    if (updates.status && updates.status !== order.status) {
      await this.addOrderStatusHistory({
        orderId: id,
        status: updates.status,
      });
    }
    
    return updatedOrder;
  }

  async getActiveOrders(): Promise<PickupOrder[]> {
    return Array.from(this.pickupOrders.values())
      .filter(order => !["completed", "cancelled"].includes(order.status));
  }

  // Agent Locations
  async getAgentLocation(agentId: number): Promise<AgentLocation | undefined> {
    return Array.from(this.agentLocations.values()).find(location => location.agentId === agentId);
  }

  async updateAgentLocation(insertLocation: InsertAgentLocation): Promise<AgentLocation> {
    const existing = await this.getAgentLocation(insertLocation.agentId);
    
    if (existing) {
      const updatedLocation = {
        ...existing,
        ...insertLocation,
        updatedAt: new Date(),
      };
      this.agentLocations.set(existing.id, updatedLocation);
      return updatedLocation;
    } else {
      const location: AgentLocation = {
        id: this.currentLocationId++,
        updatedAt: new Date(),
        ...insertLocation,
      };
      this.agentLocations.set(location.id, location);
      return location;
    }
  }

  async getAvailableAgents(): Promise<AgentLocation[]> {
    return Array.from(this.agentLocations.values())
      .filter(location => location.isAvailable);
  }

  // Order Status History
  async addOrderStatusHistory(insertHistory: InsertOrderStatusHistory): Promise<OrderStatusHistory> {
    const history: OrderStatusHistory = {
      id: this.currentHistoryId++,
      timestamp: new Date(),
      ...insertHistory,
    };
    this.orderStatusHistory.set(history.id, history);
    return history;
  }

  async getOrderStatusHistory(orderId: number): Promise<OrderStatusHistory[]> {
    return Array.from(this.orderStatusHistory.values())
      .filter(history => history.orderId === orderId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }
}

export const storage = new MemStorage();
