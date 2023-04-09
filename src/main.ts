import { program } from 'commander';
import { config } from 'dotenv';
import { indexCmd } from './cmd/indexing';
import { askCmd } from './cmd/ask';

config();

program.addCommand(indexCmd).addCommand(askCmd);

program.parse();
