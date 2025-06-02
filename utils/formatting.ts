export function formatToIDR(amount: number): string {
    if (isNaN(amount)) return 'Rp. 0';
    return (
        'Rp. ' +
        amount
            .toFixed(0)
            .replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    );
}