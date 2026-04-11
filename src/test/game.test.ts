import  Request from "supertest";
import { app } from "../server";
import { array } from "zod";

describe("Game API", () => {
    it("should create a new game", async () =>{
        const res = await Request(app)
            .post("/api/game/start")
        
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("id");
    });

    it("should allow a guess", async() =>{
        const gameRes = await Request(app)
            .post("/api/game/start");
        
        const gameId = gameRes.body.id;
        const resGuess = await Request(app)
            .post(`/api/game/${gameId}/guess`)
            .send({playerId: 10063})

        expect(resGuess.status).toBe(200);
        expect(resGuess.body).toHaveProperty("result");
        expect(resGuess.body).toHaveProperty("isWinner");
        
    })
    
    it("should search players", async() => {
        const res = await Request(app)
            .get("/api/players/search?q=ma")
        
        expect(res.status).toBe(200)
        expect(Array.isArray(res.body)).toBe(true);
    })
})



