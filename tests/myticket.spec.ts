import test, { expect } from "@playwright/test";
import { HomePage } from "../pages/home.page";
import { LoginPage } from "../pages/login.page";

const BASE_URL = "http://railwayb1.somee.com";
const DEFAULT_EMAIL = "cijnuj@ramcloud.us";
const DEFAULT_PASSWORD = "123456789";

// ===== Helpers =====

async function loginAndGotoMyTicket(page: any, email = DEFAULT_EMAIL, password = DEFAULT_PASSWORD) {
    const homePage = new HomePage(page);
    const loginPage = new LoginPage(page);

    await page.goto(BASE_URL);

    await homePage.goToLoginPage();
    await loginPage.login(email, password);
    await homePage.shouldWelcomeMsgVisible(email);

    await page.getByRole("link", { name: "My ticket" }).click();
    await expect(page.getByRole("heading", { name: "Manage ticket" })).toBeVisible();
}

async function expectNoServerError(page: any) {
    const content = await page.content();
    expect(content).not.toMatch(/(500|Internal Server Error|Server Error|Runtime Error)/i);
}

// ===== MT-001: UI of My Ticket page display properly (functional part only) =====
//
// Không test alignment/layout, chỉ test:
// - note text xuất hiện
// - bảng MyTable có đủ header
// - có nút Delete (Cancel theo spec) trong cột Operation

test("MT-001: My Ticket page shows note, table headers and operation buttons", async ({ page }) => {
    await loginAndGotoMyTicket(page);

    // Note text area
    const note = page.locator("div.message");
    await expect(note).toBeVisible();
    await expect(note).toContainText("You currently book");

    // Table headers
    const headers = page.locator("table.MyTable th");
    await expect(headers).toHaveText([
        "No.",
        "Depart Station",
        "Arrive Station",
        "Seat Type",
        "Depart Date",
        "Book Date",
        "Expired Date",
        "Status",
        "Amount",
        "Total Price",
        "Operation"
    ]);

    // Operation buttons (Delete / Cancel)
    const deleteButtons = page.locator('table.MyTable input[type="button"][value="Delete"]');
    const count = await deleteButtons.count();
    expect(count).toBeGreaterThan(0);
});

// ===== MT-002: User can view the booked tickets =====
//
// Kiểm tra có ít nhất 1 dòng vé và mỗi dòng có đầy đủ cột.

test("MT-002: Booked tickets are listed on My Ticket page", async ({ page }) => {
    await loginAndGotoMyTicket(page);

    const rows = page.locator("table.MyTable tr.OddRow, table.MyTable tr.EvenRow");
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);

    // Mỗi row phải có 11 cột (10 thông tin + 1 operation)
    for (let i = 0; i < rowCount; i++) {
        const cells = rows.nth(i).locator("td");
        await expect(cells).toHaveCount(11);
    }
});

// ===== MT-003: User can cancel tickets =====
//
// Spec nói "Cancel", UI hiện tại là "Delete".
// Ở đây mình test behavior thực tế: click Delete -> confirm -> row bị xóa.

test("MT-003: User can cancel (delete) a ticket", async ({ page }) => {
    await loginAndGotoMyTicket(page);

    const rows = page.locator("table.MyTable tr.OddRow, table.MyTable tr.EvenRow");
    const initialCount = await rows.count();
    expect(initialCount).toBeGreaterThan(0);

    // Lấy thông tin ticket đầu tiên để đảm bảo nó biến mất sau khi delete
    const firstRow = rows.first();
    const firstRowText = (await firstRow.innerText()).trim();

    // Handle confirm dialog (OK)
    page.once("dialog", dialog => dialog.accept());

    await firstRow.locator('input[type="button"][value="Delete"]').click();
    await page.waitForLoadState("networkidle");
    await expectNoServerError(page);

    const finalRows = page.locator("table.MyTable tr.OddRow, table.MyTable tr.EvenRow");
    const finalCount = await finalRows.count();

    // Số dòng phải giảm
    expect(finalCount).toBeLessThan(initialCount);

    // Không còn row có nội dung y hệt row đầu tiên nữa
    for (let i = 0; i < finalCount; i++) {
        const txt = (await finalRows.nth(i).innerText()).trim();
        expect(txt).not.toBe(firstRowText);
    }
});

// ===== MT-004: User can delete expired tickets =====
//
// Dựa theo HTML: các ô Expired có class="Expired" và text 'Expired' ở cột Status.
// Ta sẽ tìm row có td.Expired -> Delete -> confirm -> row đó không còn.

test("MT-004: User can delete an expired ticket", async ({ page }) => {
    await loginAndGotoMyTicket(page);

    // tìm dòng có cell class="Expired"
    const expiredRow = page.locator("table.MyTable tr:has(td.Expired)");
    const expiredCount = await expiredRow.count();

    // Nếu trong môi trường test không có vé expired, test này sẽ được skip
    test.skip(expiredCount === 0, "No expired tickets available to test deletion.");

    const targetRow = expiredRow.first();
    const targetText = (await targetRow.innerText()).trim();

    const rowsBefore = page.locator("table.MyTable tr.OddRow, table.MyTable tr.EvenRow");
    const countBefore = await rowsBefore.count();

    page.once("dialog", dialog => dialog.accept());
    await targetRow.locator('input[type="button"][value="Delete"]').click();
    await page.waitForLoadState("networkidle");
    await expectNoServerError(page);

    const rowsAfter = page.locator("table.MyTable tr.OddRow, table.MyTable tr.EvenRow");
    const countAfter = await rowsAfter.count();

    // Số dòng phải giảm
    expect(countAfter).toBeLessThan(countBefore);

    // Row expired ban đầu không còn xuất hiện nữa
    for (let i = 0; i < countAfter; i++) {
        const txt = (await rowsAfter.nth(i).innerText()).trim();
        expect(txt).not.toBe(targetText);
    }
});
