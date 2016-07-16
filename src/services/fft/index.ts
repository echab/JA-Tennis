import {FrameworkConfiguration} from 'aurelia-framework';

export function configure(config: FrameworkConfiguration): void {
    config.globalResources([
        './score', 
        './category', 
        './licence',
        './matchFormat',
        './rank',
        './ranking'
    ]);
}
