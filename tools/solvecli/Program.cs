// solvecli <level.json> [timeoutMs] -> prints SolveResult JSON (status + moves with paths/eaten)
using System; using System.IO; using System.Threading; using CatDom.CoreSolver; using Newtonsoft.Json;
var json = File.ReadAllText(args[0]);
int ms = args.Length > 1 ? int.Parse(args[1]) : 60000;
using var cts = new CancellationTokenSource(ms);
var r = CatLevelSolver.SolveLevel(json, cts.Token);
Console.WriteLine(JsonConvert.SerializeObject(new { status = r.status.ToString(), r.message, r.solveTimeMs, r.expanded, moves = r.moves }));
