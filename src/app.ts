import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'fs';
import { Collection, ItemGroup, Item, PropertyList, Event } from 'postman-collection';
import { parse } from 'ts-command-line-args';
import { IOptions } from './options'
import { join } from 'path';
import { sanitize, requestDefinitionFrom } from './helpers';

const args = parse<IOptions>({
    sourcePath: { type: String, optional: true as const },
    destinationPath: { type: String, optional: true as const },
});

const sourcePostmanCollectionPath = args.sourcePath.toString();
const sourcePostmanCollection = JSON.parse(readFileSync(sourcePostmanCollectionPath).toString());

const destinationPaths = [ args.destinationPath ];

const sourceCollection = new Collection(sourcePostmanCollection);

function processItems(items : PropertyList<Item | ItemGroup<Item>>) {
    for (const item of items.all()) {
        if (item instanceof Item) {
            processItem(item);
            continue;
        }

        const propertyGroup = <ItemGroup<Item>>item;
        destinationPaths.push(sanitize(item.name));
        processItems(propertyGroup.items);
        destinationPaths.pop();
    }
}

function processItem(item : Item) {
    const directory = join(...destinationPaths);

    if (!existsSync(directory)) {
        console.log(`Creating directory ${directory}...`);
        mkdirSync(directory, { recursive: true });
    }

    const filename = `${sanitize(item.name)}.http`;
    console.log(`Creating file ${filename}...`);
    const path = join(directory, filename);

    console.log('Writing request definition...');
    const requestDefinition = requestDefinitionFrom(item);
    console.log(requestDefinition);

    writeFileSync(path, requestDefinition, { flag: 'w' });
}

processItems(sourceCollection.items);