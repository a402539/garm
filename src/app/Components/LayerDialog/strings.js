import T from '@scanex/translations';

T.addText('ru', {    
    dialog: {
        layer: {
            name: 'Название'
        },      
    },
});
T.addText('en', {
    dialog: {
        layer: {
            name: 'Name'
        },        
    },    
});

export default T.getText.bind(T);