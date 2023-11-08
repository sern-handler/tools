type Routes = 
    | ["GlobalGetAll", "/applications/{application.id}/commands"]
    | ["GlobalGet",    "/applications/{application.id}/commands/commands/{command.id}"]
    | ["GlobalPost",   "/applications/{application.id}/commands"]
    | ["GlobalEdit",   "/applications/{application.id}/commands/{command.id}"]
    | ["GlobalDelete", "/applications/{application.id}/commands/{command.id}"]
    | ["global/put",    ["GET", "/applications/{application.id}/commands"]]
    | ["GuildGetAll",  "/applications/{application.id}/guilds/{guild.id}/commands"]
    | ["GuildPost",    "/applications/{application.id}/guilds/{guild.id}/commands"]
    | ["GuildGet",     "/applications/{application.id}/guilds/{guild.id}/commands/{command.id}"]
    | ["GuildEdit",    "/applications/{application.id}/guilds/{guild.id}/commands/{command.id}"]
    | ["GuildDelete",  "/applications/{application.id}/guilds/{guild.id}/commands/{command.id}"]
    | ["GuildPut",     "/applications/{application.id}/guilds/{guild.id}/commands"]

