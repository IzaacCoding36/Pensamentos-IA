const nomes = ["Fernanda", "Juliana", "Maria Eduarda", "Marcelo", "Amanda", "Gustavo", "Gabriel", "Izaac", "Rafael", "Caio", "William"];

export function aleatorio (lista){
    const posicao = Math.floor(Math.random()* lista.length);
    return lista[posicao];
}

export const nome = aleatorio(nomes)