import T from '@scanex/translations';

T.addText('ru', {
    dialog: {
        map: {
            name: 'Название'
        },      
    },
});

T.addText('en', {    
    dialog: {
        map: {
            name: 'Name'
        },        
    },    
});

export default T.getText.bind(T);