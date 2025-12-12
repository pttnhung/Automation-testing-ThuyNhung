import { Locator, Page } from "@playwright/test";

export class MyTicketPage {

    private readonly page: Page;

    // ======= Locators =======
    readonly title: Locator;
    readonly message: Locator;
    readonly table: Locator;
    readonly rows: Locator;

    // Delete button theo ID vé → DeleteTicket(xxx)
    getDeleteButtonById(ticketId: number): Locator {
        return this.page.locator(`input[onclick="DeleteTicket(${ticketId});"]`);
    }

    // Delete button theo Depart – Arrive
    getDeleteButtonByRoute(depart: string, arrive: string): Locator {
        return this.page.locator(
            `//table[@class='MyTable']//tr[
                td[2][normalize-space()='${depart}'] and 
                td[3][normalize-space()='${arrive}']
            ]//input[@value='Delete']`
        );
    }

    // Delete button theo dòng (1-based index)
    getDeleteButtonByRow(rowIndex: number): Locator {
        return this.page.locator(
            `(//table[@class='MyTable']//input[@value='Delete'])[${rowIndex}]`
        );
    }

    constructor(page: Page) {
        this.page = page;

        // Trang có title "Manage ticket"
        this.title = this.page.getByRole("heading", { name: "Manage ticket" });

        // Thông báo note
        this.message = this.page.locator("div.message");

        // Bảng chứa ticket
        this.table = this.page.locator("table.MyTable");

        // Rows chứa vé (bỏ row header)
        this.rows = this.page.locator(
            "table.MyTable tr.OddRow, table.MyTable tr.EvenRow"
        );
    }

    // ======= Actions =======

    async open(): Promise<void> {
        await this.page.goto("/Page/ManageTicket.cshtml");
        await this.title.waitFor({ state: "visible" });
    }

    async countTickets(): Promise<number> {
        return this.rows.count();
    }

    async deleteTicketById(ticketId: number): Promise<void> {
        await this.getDeleteButtonById(ticketId).click();
        await this.page.on("dialog", dialog => dialog.accept());
    }

    async deleteTicketByRoute(depart: string, arrive: string): Promise<void> {
        await this.getDeleteButtonByRoute(depart, arrive).click();
        await this.page.on("dialog", dialog => dialog.accept());
    }

    async deleteTicketRow(rowIndex: number): Promise<void> {
        await this.getDeleteButtonByRow(rowIndex).click();
        await this.page.on("dialog", dialog => dialog.accept());
    }

}
