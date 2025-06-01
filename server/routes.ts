import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertPickupOrderSchema, insertAgentLocationSchema, insertUserSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (data.type === 'updateLocation' && data.agentId && data.latitude && data.longitude) {
          // Update agent location
          await storage.updateAgentLocation({
            agentId: data.agentId,
            latitude: data.latitude,
            longitude: data.longitude,
            isAvailable: data.isAvailable ?? true,
          });
          
          // Broadcast to all clients
          wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: 'locationUpdate',
                agentId: data.agentId,
                latitude: data.latitude,
                longitude: data.longitude,
                isAvailable: data.isAvailable ?? true,
              }));
            }
          });
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
  });

  // Auth endpoints
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      res.json({ user: { ...user, password: undefined } });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const user = await storage.createUser(userData);
      res.json({ user: { ...user, password: undefined } });
    } catch (error) {
      res.status(400).json({ message: "Registration failed" });
    }
  });

  // Material categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getMaterialCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Pickup orders
  app.post("/api/orders", async (req, res) => {
    try {
      const orderData = insertPickupOrderSchema.parse(req.body);
      const order = await storage.createPickupOrder(orderData);
      
      // Try to assign to nearest available agent
      const availableAgents = await storage.getAvailableAgents();
      if (availableAgents.length > 0) {
        const assignedAgent = availableAgents[0]; // Simple assignment logic
        await storage.updatePickupOrder(order.id, {
          agentId: assignedAgent.agentId,
          status: "assigned",
        });
        
        // Broadcast order assignment
        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              type: 'orderAssigned',
              orderId: order.id,
              agentId: assignedAgent.agentId,
            }));
          }
        });
      }
      
      res.json(order);
    } catch (error) {
      res.status(400).json({ message: "Failed to create order" });
    }
  });

  app.get("/api/orders/customer/:customerId", async (req, res) => {
    try {
      const customerId = parseInt(req.params.customerId);
      const orders = await storage.getOrdersByCustomer(customerId);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/agent/:agentId", async (req, res) => {
    try {
      const agentId = parseInt(req.params.agentId);
      const orders = await storage.getOrdersByAgent(agentId);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const order = await storage.getPickupOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.patch("/api/orders/:id", async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const updates = req.body;
      
      const order = await storage.updatePickupOrder(orderId, updates);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Broadcast status update
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'orderStatusUpdate',
            orderId: orderId,
            status: updates.status,
            order: order,
          }));
        }
      });
      
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to update order" });
    }
  });

  // Agent locations
  app.get("/api/agents/locations", async (req, res) => {
    try {
      const locations = await storage.getAvailableAgents();
      const agents = await storage.getAgents();
      
      const agentLocations = locations.map(location => {
        const agent = agents.find(a => a.id === location.agentId);
        return {
          ...location,
          agent: agent ? { ...agent, password: undefined } : null,
        };
      });
      
      res.json(agentLocations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch agent locations" });
    }
  });

  app.post("/api/agents/location", async (req, res) => {
    try {
      const locationData = insertAgentLocationSchema.parse(req.body);
      const location = await storage.updateAgentLocation(locationData);
      res.json(location);
    } catch (error) {
      res.status(400).json({ message: "Failed to update location" });
    }
  });

  // Order status history
  app.get("/api/orders/:id/history", async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const history = await storage.getOrderStatusHistory(orderId);
      res.json(history);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order history" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const orders = await storage.getOrdersByCustomer(userId);
      const completedOrders = orders.filter(order => order.status === "completed");
      
      const totalEarnings = completedOrders.reduce((sum, order) => {
        return sum + parseFloat(order.actualEarning || order.estimatedEarning || "0");
      }, 0);
      
      const totalWeight = completedOrders.reduce((sum, order) => {
        return sum + parseFloat(order.actualWeight || order.estimatedWeight || "0");
      }, 0);
      
      res.json({
        totalEarnings: Math.round(totalEarnings),
        totalPickups: user.totalPickups,
        totalWeight: Math.round(totalWeight),
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  return httpServer;
}
