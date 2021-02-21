import {Parser} from "binary-parser-encoder"


class VParser extends Parser {
    constructor(opts) {
        super(opts)
        return super.endianess("little")
    }

    /*
    int(name) {
        return this.uint32le(name)
    }

    float(name) {
        return this.floatle(name)
    }

    bool(name) {
        return this.uint8(name)
    }
    */

    vstring(name) {
        const lenId = `${name}__strlen`
        //return this.uint8(lenId).string(name, {length: lenId})
        return this.uint8(lenId).string(name, {length: lenId})
    }

    vbuf(name) {
        const lenId = `${name}__buflen`
        return this.uint32(lenId).buffer(`${name}__buf`, {length: lenId})
    }

    varray(name, type) {
        const lenId = `${name}__arrlen`
        return this.uint32le(lenId).array(name, { type: type, length: lenId })
    }
}

const VString = new VParser()
    .namely("vstring")
    .vstring("text")
    //done

const Vector3 = new VParser()
    .namely("vector3")
    .floatle("x")
    .floatle("y")
    .floatle("z")
    //done

const Vector2i = new VParser()
    .namely("vector2i")
    .uint32("x")
    .uint32("y")
    //done

const Item = new VParser()
    .namely("item")
    .vstring("name")
    .uint32("count")
    .floatle("durability")
    .nest("gridPos", {type: Vector2i})
    .uint8("equipped")
    .uint32("quality")
    .uint32("variant")
    .uint64("crafterID")
    .vstring("crafterName")
    //done

const Inventory = new VParser()
    .namely("inventory")
    .uint32("__magic__", { assert: 103 })
    .varray("items", "item")
    //done

const Skill = new VParser()
    .namely("skill")
    .uint32("skillId")
    .floatle("level")
    .floatle("accumulator")
    //done

const Skills = new VParser()
    .namely("skills")
    .uint32("__magic__", { assert: 2 })
    .varray("skills", "skill")
    //done

const KnownBiome = new VParser()
    .namely("knownbiome")
    .uint32("id")

const KnownStation = new VParser()
    .namely("knownstation")
    .vstring("key")
    .uint32("value")
    //done

const KnownText = new VParser()
    .namely("knowntext")
    .vstring("key")
    .vstring("value")
    //done

const Food = new VParser()
    .namely("food")
    .vstring("name")
    .floatle("health")
    .floatle("stamina")
    //done

const PlayerData = new VParser()
    .namely("playerdata")
    // the fields
    .uint32("__magic__", { assert: 24 })
    .floatle("maxHealth")
    .floatle("health")
    .floatle("maxStamina")
    .uint8("firstSpawn")
    .floatle("timeSinceDeath")
    .vstring("guardianPower")
    .floatle("guardianPowerCooldown")
    //.buffer("tempTest", {readUntil: "eof"})
    .nest("inventory", {type: Inventory})
    .varray("knownRecipes", "vstring")
    .varray("knownStations", "knownstation")
    .varray("knownMaterial", "vstring")
    .varray("shownTutorials", "vstring")
    .varray("uniques", "vstring")
    .varray("trophies", "vstring")
    .varray("knownBiome", "knownbiome")
    .varray("knownTexts", "knowntext")
    .vstring("beardItem")
    .vstring("hairItem")
    .nest("skinColor", {type: Vector3})
    .nest("hairColor", {type: Vector3})
    .uint32("modelIndex")
    .varray("foods", "food")
    .nest("skills", {type: Skills})
    //done

const DoNothing = new VParser()
    .buffer("empty", {
        readUntil: function(_item, _buf) {
            return true
        }
    })
    //done

const MapData = new VParser()
    .vbuf("mapDataBytes")
    //done

const WorldData = new VParser()
    .namely("worlddata")
    .uint64("key") //24-32
    .uint8("haveCustomSpawnPoint")
    .nest("spawnPoint", {type: Vector3})
    .uint8("haveLogoutPoint")
    .nest("logoutPoint", {type: Vector3})
    .uint8("haveDeathPoint")
    .nest("deathPoint", {type: Vector3})
    .nest("homePoint", {type: Vector3})
    .uint8("hasMapData")
    .choice("mapData", {
        tag: "hasMapData",
        choices: {
            0: DoNothing,
            1: MapData
        }
    })
    //done




const PlayerDataWrapper = new VParser()
    //.namely("playerdatawrapper")
    .uint32("__playerdatalength__")
    .nest(null, {type: PlayerData})



const PlayerProfile = new VParser()
    .namely("playerprofile")
    .uint32("__magic__", { assert: 32 }) // 4
    .uint32("stat_kills") // 8
    .uint32("stat_deaths") // 12
    .uint32("stat_crafts") // 16
    .uint32("stat_builds") // 20
    .varray("worldData", "worlddata")
    .vstring("playerName")
    .uint64("playerID")
    .vstring("startSeed")
    .uint8("hasPlayerData")
    .choice("playerData", {
        tag: "hasPlayerData",
        choices: {
            0: DoNothing,
            1: PlayerDataWrapper
        }
    })
    //done


const CharFile = new VParser()
    .namely("charfile")
    .uint32le("__playerprofilelength__") //0..4
    .nest("profile", {type: PlayerProfile}) 
    .vbuf("__hash__")
    //done

const CharFileParser = new VParser()
    .nest(null, {type: CharFile})
    //done



const PlayerDataParser = new VParser()
    .nest(null, {type: PlayerData})
    //done

const PlayerProfileParser = new VParser()
    .nest(null, {type: PlayerProfile})
    //done


// compile the parser and encoder
CharFileParser.compile()
CharFileParser.compileEncode()

export {
    CharFileParser,
    PlayerProfileParser,
    PlayerDataParser
}