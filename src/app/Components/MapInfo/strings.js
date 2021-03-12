import T from '@scanex/translations';

T.addText('ru', {    
    info: {
        map: {
            name: 'Название'
        }
    }, 
});
T.addText('en', {
    info: {
        map: {
            name: 'Name'
        }
    },
});

export default T.getText.bind(T);