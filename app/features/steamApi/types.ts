interface IPlayerService {
  GetOwnedGames?: GetOwnedGames;
}

interface SteamAuth {
  id?: string;
  err: boolean;
  message: string;
}
