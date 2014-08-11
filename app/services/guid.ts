'use strict';

module jat.service {
    
    export class Guid {

        /** Create an unique identifier */
        public create(prefix: string) {
            return (prefix || '') + Math.round(Math.random() * 999);
        }
    }
}
