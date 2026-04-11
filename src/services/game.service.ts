import { prisma } from "../lib/prisma";

type hint = "correct" | "wrong" | "higher" | "lower"

export function comparePlayers(secret: any, guess: any){
    const result = {
        team: guess.teamId === secret?.teamId ? "correct" : "incorrect",
        position: guess.position === secret?.position ? "correct" : "incorrect",
        jersey: guess.jerseyNumber === secret?.jerseyNumber ? "correct" : guess.jerseyNumber > secret?.jerseyNumber ? "lower" : "higher",
        conference: guess.team.conference === secret?.team.conference ? "correct" : "incorrect",
        division: guess.team.division === secret?.team.division ? "correct" : "incorrect"
    }
        
    const isWinner =
        result.team === "correct" &&
        result.position === "correct" &&
        result.jersey === "correct"

    
    return { result, isWinner }

}

export async function startGameService(){
    const players = await prisma.player.findMany()

    const random = players[Math.floor(Math.random() * players.length)]

    const game = await prisma.gameSession.create({
        data: {
            secretPlayerId : random.id
        }
    })

    return game;

}

export async function getGameService(req: Number){
      const gameId = Number(req);
        const game = await prisma.gameSession.findUnique({
            where: {id: gameId}
        });
    
        if (!game){
            return({ error: "Game not found" });
        }
    
        return game;
}

export async function getTopGamesService(){
     const topGames = await prisma.gameSession.findMany({
        where: {
            isFinished : true,
            score: {not: null},
        },
        orderBy: { score: "desc"},
        take: 10
    })

    return topGames;
}

export async function getDailyGameService(){

    const today = new Date().toISOString().split("T")[0];
    let dailyGame = await prisma.dailyGame.findUnique({
        where: {date: today}
    });

    if( !dailyGame ){
        const players = await prisma.player.findMany();
        const random = players[Math.floor(Math.random() * players.length )]
        
        dailyGame = await prisma.dailyGame.create({
            data: {
                date: today,
                secretPlayerId: random.id
            }
        });        
    }

    return ({ dailyGameId: dailyGame.id })
}

export async function makeGuessService(gameId: number, playerId: number){
    
    const game = await prisma.gameSession.findUnique({
        where: { id: gameId }
    })

    if (!game){
        return ({error: "Game not found"});
    }

    const guessCount = await prisma.guess.count({
        where: { gameSessionId: gameId }
    })
    if ( guessCount > 5 ){
        return ({
            message: "Maximum number of guesses reached",
            error:true
        });
    }
    const guessedPlayer = await prisma.player.findUnique({
        select:{
            name:true,
            position: true,
            jerseyNumber: true,
            teamId: true,
            team:{
                select:{
                    name: true,
                    division: true,
                    conference:true
                }
            }
        },
        where: {id: playerId}
    })

    if( !guessedPlayer ){
        return ({error: "Player not found"});
    }

    const secret = await prisma.player.findUnique({
        select:{
            name:true,
            position: true,
            jerseyNumber: true,
            teamId: true,
            team:{
                select:{
                    division: true,
                    conference:true
                }
            }
        },
        where: { id: game.secretPlayerId}
    });

    const { result, isWinner } = comparePlayers(secret, guessedPlayer);
    let score = 0
    if (isWinner) {
        const attemps = guessCount + 1;    

        const scoreTable = [100, 80, 60, 40, 20, 10, 0];
        score = scoreTable[attemps - 1] ?? 0;

        await prisma.gameSession.update({
        where: { id: gameId },
        data: { attempts: attemps, isFinished: true, isWin: true, score  }
        })
    }else{
        if (guessCount === 5) {
            await prisma.gameSession.update({
                    where: { id: gameId },
                    data: { attempts: 6, isFinished: true, isWin: false, score: 0   }
                    })
        }
    }

    await prisma.guess.create({
        data: {
            gameSessionId : gameId,
            playerId : playerId,
            result : isWinner
        }
    });

    return ({
        player: guessedPlayer.name,
        position: guessedPlayer.position,
        jersey: guessedPlayer.jerseyNumber,
        team: guessedPlayer.team.name,
        conference: guessedPlayer.team.conference,
        division: guessedPlayer.team.division,
        result,
        isWinner,
        score,
        isFinished: guessCount == 5 ? true : false,
        secretPlayer: secret?.name
    })
}