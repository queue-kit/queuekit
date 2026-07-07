#!/usr/bin/env node
import { Command } from "commander";
import { init } from "./commands/init";
import { health } from "./commands/health";

const program = new Command();

program
  .name("queuekit")
  .description("QueueKit CLI - zero-config job queue tooling")
  .version("0.0.1");

program.command("init").description("Interactive setup wizard").action(init);

program
  .command("health")
  .description(
    "Check broker/database health by calling the running QueueKit API",
  )
  .option("-u, --url <url>", "QueueKit API base URL", "http://localhost:3000")
  .action((opts) => health(opts.url));

program.parse(process.argv);
