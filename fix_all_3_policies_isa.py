with open('public/index.html', 'rb') as f:
    html = f.read().decode('utf-8', errors='replace')

# 1. Update Phase 4: Attendance Policy Panel (#panelAttendance)
old_att_block = '''          <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 5px;">
            <p style="color: #8FA0B8; font-size: 14px; margin: 0;">Select your Job Profile to view Attendance Policy &amp; Quiz:</p>
            <div style="display: flex; gap: 10px; width: 100%;">
              <button class="part-btn" id="btnAttFreelance" style="flex: 1; padding: 12px; font-weight: 600;">Freelancer / ISA</button>
              <button class="part-btn" id="btnAttFse" style="flex: 1; padding: 12px; font-weight: 600;">FSE (Field Sales Executive)</button>
            </div>
          </div>

          <!-- Freelancer Attendance Info (Hidden initially) -->
          <div id="attFreelanceInfo" style="display: none; flex-direction: column; gap: 15px;">
            <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--line); border-radius: 8px; padding: 15px;">
              <h4 style="color: #fff; margin-top: 0; margin-bottom: 8px;">Freelancer / ISA (Independent Sales Executive)</h4>
              <p style="color: #8FA0B8; font-size: 13.5px; line-height: 1.5; margin: 0;">
                No minimum daily visit requirements or fixed working hours. Simply register leads and meetings in the Commando App to track deals. No daily attendance logging is required.
              </p>
            </div>
          </div>

          <!-- FSE Attendance Info (Hidden initially) -->
          <div id="attFseInfo" style="display: none; flex-direction: column; gap: 15px;">'''

new_att_block = '''          <div style="width: 100%; margin-bottom: 10px;">
            <button class="part-btn active" style="width: 100%; padding: 12px; font-weight: 700; background: var(--amber); color: #000; cursor: default; border-radius: 10px; font-size: 14px;">ISA (Field Executive)</button>
          </div>

          <!-- Hidden dummy elements for JS listener compatibility -->
          <button id="btnAttFreelance" style="display: none;"></button>
          <button id="btnAttFse" style="display: none;"></button>
          <div id="attFreelanceInfo" style="display: none;"></div>

          <!-- ISA (Field Executive) Attendance Info (Visible by default) -->
          <div id="attFseInfo" style="display: flex; flex-direction: column; gap: 15px;">'''

if old_att_block in html:
    html = html.replace(old_att_block, new_att_block)
    print("Updated Phase 4 Attendance Policy HTML!")

# 2. Update Phase 5: Employment Policy Panel (#panelEmployment)
old_emp_block = '''        <!-- TAB 2: EMPLOYMENT CONTENT -->
        <div id="panelEmployment" class="vmeta policy-panel" style="display: none; flex-direction: column; gap: 20px;">
          <h2 style="font-family: 'Archivo'; color: #fff; margin-top: 0; font-size: 20px;">📋 Employment Policy</h2>
          
          <p style="color: #8FA0B8; font-size: 14px; margin: 0; line-height: 1.5;">
            Select your Job Profile below to review training rules and target policies:
          </p>

          <div style="display: flex; gap: 10px; width: 100%;">
            <button class="part-btn" id="btnEmpFreelance" style="flex: 1; padding: 12px; font-weight: 600;">Freelancer / ISA</button>
            <button class="part-btn" id="btnEmpFse" style="flex: 1; padding: 12px; font-weight: 600;">FSE (Field Sales Executive)</button>
          </div>

          <!-- Freelancer / ISA employment content -->
          <div id="empFreelanceInfo" style="background: rgba(255,255,255,0.02); border: 1px solid var(--line); border-radius: 8px; padding: 15px; display: none;">
            <h4 style="color: #fff; margin-top: 0; margin-bottom: 8px;">Freelancer / ISA Guidelines</h4>
            <p style="color: #8FA0B8; font-size: 13.5px; line-height: 1.5; margin: 0;">
              • Full flexibility: Work whenever you want.<br>
              • No training target bounds or weekly targets.<br>
              • Earn commission per sale directly.
            </p>
          </div>

          <!-- FSE employment content -->
          <div id="empFseInfo" style="background: rgba(255,255,255,0.02); border: 1px solid var(--line); border-radius: 8px; padding: 15px; display: none;">
            <h4 style="color: #fff; margin-top: 0; margin-bottom: 12px;">FSE (Full-Time) Target Policy</h4>
            
            <div style="display: flex; flex-direction: column; gap: 10px; font-size: 13px;">
              <div style="display: flex; gap: 10px; border-bottom: 1px solid var(--line); padding-bottom: 6px;">
                <span style="font-weight: 700; color: var(--green); width: 130px; shrink: 0;">Week 1:</span>
                <span style="color: #8FA0B8;"><b>Training Period</b> (Joining + 1 week)</span>
              </div>
              <div style="display: flex; gap: 10px; border-bottom: 1px solid var(--line); padding-bottom: 6px;">
                <span style="font-weight: 700; color: var(--amber); width: 130px; shrink: 0;">Week 2:</span>
                <span style="color: #8FA0B8;"><b>Grace Period</b> to establish pipeline</span>
              </div>
              <div style="display: flex; gap: 10px; padding-bottom: 6px;">
                <span style="font-weight: 700; color: #ef4444; width: 130px; shrink: 0;">Week 3 onwards:</span>
                <span style="color: #8FA0B8;"><b>Minimum 1 Sale per week required</b> to continue employment.</span>
              </div>
            </div>
          </div>

          <button class="done-btn" id="btnGoToIncentive" disabled style="margin-top: 10px; width: 100%;">Proceed to Incentive Policy →</button>
        </div>'''

new_emp_block = '''        <!-- TAB 2: EMPLOYMENT CONTENT -->
        <div id="panelEmployment" class="vmeta policy-panel" style="display: none; flex-direction: column; gap: 20px;">
          <h2 style="font-family: 'Archivo'; color: #fff; margin-top: 0; font-size: 20px;">📋 Employment Policy</h2>
          
          <div style="width: 100%;">
            <button class="part-btn active" style="width: 100%; padding: 12px; font-weight: 700; background: var(--amber); color: #000; cursor: default; border-radius: 10px; font-size: 14px;">ISA (Field Executive)</button>
          </div>

          <button id="btnEmpFreelance" style="display: none;"></button>
          <button id="btnEmpFse" style="display: none;"></button>
          <div id="empFreelanceInfo" style="display: none;"></div>

          <!-- ISA Target Policy -->
          <div id="empFseInfo" style="background: rgba(255,255,255,0.02); border: 1px solid var(--line); border-radius: 10px; padding: 18px; display: flex; flex-direction: column; gap: 12px;">
            <h4 style="color: #fff; margin-top: 0; margin-bottom: 4px; font-size: 15.5px;">Target Policy (Minimum 1 POS Sale per Week)</h4>
            
            <div style="display: flex; flex-direction: column; gap: 10px; font-size: 13.5px;">
              <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--line); padding-bottom: 8px;">
                <span style="font-weight: 700; color: #fff;">Week 1</span>
                <span style="color: var(--green); font-weight: 700;">Minimum 1 Sale per week</span>
              </div>
              <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--line); padding-bottom: 8px;">
                <span style="font-weight: 700; color: #fff;">Week 2</span>
                <span style="color: var(--green); font-weight: 700;">Minimum 1 Sale per week</span>
              </div>
              <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--line); padding-bottom: 8px;">
                <span style="font-weight: 700; color: #fff;">Week 3</span>
                <span style="color: var(--green); font-weight: 700;">Minimum 1 Sale per week</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding-bottom: 4px;">
                <span style="font-weight: 700; color: #fff;">Week 4</span>
                <span style="color: var(--green); font-weight: 700;">Minimum 1 Sale per week</span>
              </div>
            </div>

            <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 8px; padding: 10px; color: var(--green); font-size: 12.5px; font-weight: 600;">
              📌 Monthly Target: Minimum 4 POS Machine sales per calendar month (1 sale/week required).
            </div>
          </div>

          <button class="done-btn" id="btnGoToIncentive" style="margin-top: 10px; width: 100%;">Proceed to Incentive Policy →</button>
        </div>'''

if old_emp_block in html:
    html = html.replace(old_emp_block, new_emp_block)
    print("Updated Phase 5 Employment Policy HTML!")

# 3. Update Phase 6: Incentive Policy Panel (#panelIncentive)
old_inc_block = '''        <!-- TAB 3: INCENTIVE CONTENT -->
        <div id="panelIncentive" class="vmeta policy-panel" style="display: none; flex-direction: column; gap: 20px;">
          <h2 style="font-family: 'Archivo'; color: #fff; margin-top: 0; font-size: 20px;">📋 Incentive Policy</h2>
          
          <p style="color: #8FA0B8; font-size: 14px; margin: 0; line-height: 1.5;">
            Select your Job Profile below to review your earning model:
          </p>

          <div style="display: flex; gap: 10px; width: 100%;">
            <button class="part-btn" id="btnIncFreelance" style="flex: 1; padding: 12px; font-weight: 600;">Freelancer / ISA</button>
            <button class="part-btn" id="btnIncFse" style="flex: 1; padding: 12px; font-weight: 600;">FSE (Field Sales Executive)</button>
          </div>

          <!-- Freelancer / ISA incentive info -->
          <div id="incFreelanceInfo" style="display: none; flex-direction: column; gap: 15px;">
            <h4 style="color: #fff; margin: 0;">Freelancer Incentive Plan Table</h4>
            
            <div style="background: var(--bg); border: 1px solid var(--line); border-radius: var(--radius); overflow-x: auto; font-size: 12px;">
              <table style="width: 100%; border-collapse: collapse; text-align: left;">
                <thead>
                  <tr style="background: rgba(255,255,255,0.03); border-bottom: 1px solid var(--line); color: #fff; font-weight: 700;">
                    <th style="padding: 8px 10px;"># Devices Sold</th>
                    <th style="padding: 8px 10px;">Incentive Rate</th>
                    <th style="padding: 8px 10px;">Incentive Amount</th>
                    <th style="padding: 8px 10px;">Fixed Retainer</th>
                    <th style="padding: 8px 10px; color: var(--green);">Total Payout</th>
                  </tr>
                </thead>
                <tbody style="color: #8FA0B8;">
                  <tr style="border-bottom: 1px solid var(--line); color: #ef4444;">
                    <td style="padding: 6px 10px; font-weight: 700;">0</td>
                    <td style="padding: 6px 10px;">NIL</td>
                    <td style="padding: 6px 10px;">NIL</td>
                    <td style="padding: 6px 10px;">NIL</td>
                    <td style="padding: 6px 10px; font-weight: 700;">NIL</td>
                  </tr>
                  <tr style="border-bottom: 1px solid var(--line);">
                    <td style="padding: 6px 10px; font-weight: 700; color: #fff;">1 - 4</td>
                    <td style="padding: 6px 10px;">1500 per device</td>
                    <td style="padding: 6px 10px;">1,500 - 6,000</td>
                    <td style="padding: 6px 10px;">NIL</td>
                    <td style="padding: 6px 10px; font-weight: 700; color: #fff;">1,500 - 6,000</td>
                  </tr>
                  <tr style="border-bottom: 1px solid var(--line); background: rgba(16, 185, 129, 0.02);">
                    <td style="padding: 6px 10px; font-weight: 700; color: #fff;">5 - 9</td>
                    <td style="padding: 6px 10px;">1500 per device</td>
                    <td style="padding: 6px 10px;">7,500 - 13,500</td>
                    <td style="padding: 6px 10px; color: var(--amber);">4,000</td>
                    <td style="padding: 6px 10px; font-weight: 700; color: var(--green);">11,500 - 17,500</td>
                  </tr>
                  <tr style="background: rgba(16, 185, 129, 0.04);">
                    <td style="padding: 6px 10px; font-weight: 700; color: #fff;">10 - 12+</td>
                    <td style="padding: 6px 10px; color: var(--green);">2000 per device (progressive)</td>
                    <td style="padding: 6px 10px;">15,500 - 19,500+</td>
                    <td style="padding: 6px 10px; color: var(--amber);">4,000</td>
                    <td style="padding: 6px 10px; font-weight: 700; color: var(--green);">19,500 - 23,500+</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style="background: rgba(240, 162, 39, 0.1); border: 1px solid var(--amber); border-radius: 8px; padding: 10px; color: var(--amber); font-size: 12.5px; font-weight: 600;">
              ⚠️ T&amp;C: Full Payment is required for incentive eligibility.
            </div>

            <!-- Freelancer Quiz Question -->
            <div id="incFreelanceQuizBox" style="display: flex; flex-direction: column; gap: 10px; border-top: 1px solid var(--line); padding-top: 12px;">
              <h3 style="font-family: 'Archivo'; color: #fff; margin: 0; font-size: 14.5px;">✏️ Incentive Question (Freelancer):</h3>
              <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--line); border-radius: 8px; padding: 12px; display: flex; flex-direction: column; gap: 6px; font-size: 13px;">
                <div><b style="color: var(--amber);">English:</b> I have done 5 sales. My monthly incentive would be?</div>
                <div style="border-top: 1px dashed var(--line); padding-top: 6px;"><b style="color: var(--amber);">Hindi:</b> प्रश्न: मैंने 5 बिक्री (Sales) की हैं। मेरा मासिक इंसेंटिव क्या होगा?</div>
                <div style="border-top: 1px dashed var(--line); padding-top: 6px;"><b style="color: var(--amber);">Hinglish:</b> Question: Maine 5 sales kiye hain. Mera monthly incentive kya hoga?</div>
              </div>
              <div style="display: flex; flex-direction: column; gap: 8px;" class="quiz-options" id="incFreelanceOptions">
                <button class="part-btn" data-ans="7500" style="text-align: left; padding: 8px 12px; font-size: 12.5px; width: 100%;">7,500</button>
                <button class="part-btn" data-ans="11500" style="text-align: left; padding: 8px 12px; font-size: 12.5px; width: 100%;">11,500 (7,500 + 4,000 retainer)</button>
                <button class="part-btn" data-ans="6000" style="text-align: left; padding: 8px 12px; font-size: 12.5px; width: 100%;">6,000</button>
                <button class="part-btn" data-ans="NIL" style="text-align: left; padding: 8px 12px; font-size: 12.5px; width: 100%;">NIL</button>
              </div>
              <div id="incFreelanceFeedback" style="font-size: 13px; font-weight: 600; min-height: 20px;"></div>
            </div>
          </div>

          <!-- FSE incentive info -->
          <div id="incFseInfo" style="display: none; flex-direction: column; gap: 15px;">
            <h4 style="color: #fff; margin: 0;">FSE Incentive Plan</h4>
            
            <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--line); border-radius: 8px; padding: 15px; font-size: 13.5px; color: #8FA0B8; line-height: 1.6;">
              • <b>Upto 4 Sales</b>: No incentive (NIL)<br>
              • <b>5th Sale onwards</b>: 500 per device
            </div>

            <!-- FSE Quiz Question -->
            <div id="incFseQuizBox" style="display: flex; flex-direction: column; gap: 10px; border-top: 1px solid var(--line); padding-top: 12px;">
              <h3 style="font-family: 'Archivo'; color: #fff; margin: 0; font-size: 14.5px;">✏️ Incentive Question (FSE):</h3>
              <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--line); border-radius: 8px; padding: 12px; display: flex; flex-direction: column; gap: 6px; font-size: 13px;">
                <div><b style="color: var(--amber);">English:</b> I have done 5 sales as FSE. My monthly incentive would be?</div>
                <div style="border-top: 1px dashed var(--line); padding-top: 6px;"><b style="color: var(--amber);">Hindi:</b> प्रश्न: मैंने FSE के रूप में 5 बिक्री (Sales) की हैं। मेरा इंसेंटिव क्या होगा?</div>
                <div style="border-top: 1px dashed var(--line); padding-top: 6px;"><b style="color: var(--amber);">Hinglish:</b> Question: Maine FSE ke roop mein 5 sales kiye hain. Mera incentive kya hoga?</div>
              </div>
              <div style="display: flex; flex-direction: column; gap: 8px;" class="quiz-options" id="incFseOptions">
                <button class="part-btn" data-ans="NIL" style="text-align: left; padding: 8px 12px; font-size: 12.5px; width: 100%;">NIL</button>
                <button class="part-btn" data-ans="500" style="text-align: left; padding: 8px 12px; font-size: 12.5px; width: 100%;">500 (only 5th sale qualifies)</button>
                <button class="part-btn" data-ans="2500" style="text-align: left; padding: 8px 12px; font-size: 12.5px; width: 100%;">2,500 (500 x 5)</button>
                <button class="part-btn" data-ans="1000" style="text-align: left; padding: 8px 12px; font-size: 12.5px; width: 100%;">1,000</button>
              </div>
              <div id="incFseFeedback" style="font-size: 13px; font-weight: 600; min-height: 20px;"></div>
            </div>
          </div>

          <button class="done-btn" id="attendanceFinishBtn" disabled style="margin-top: 10px; width: 100%;">Complete &amp; Get Certificate</button>
        </div>'''

new_inc_block = '''        <!-- TAB 3: INCENTIVE CONTENT -->
        <div id="panelIncentive" class="vmeta policy-panel" style="display: none; flex-direction: column; gap: 20px;">
          <h2 style="font-family: 'Archivo'; color: #fff; margin-top: 0; font-size: 20px;">📋 Incentive Policy</h2>
          
          <div style="width: 100%;">
            <button class="part-btn active" style="width: 100%; padding: 12px; font-weight: 700; background: var(--amber); color: #000; cursor: default; border-radius: 10px; font-size: 14px;">ISA (Field Executive)</button>
          </div>

          <button id="btnIncFreelance" style="display: none;"></button>
          <button id="btnIncFse" style="display: none;"></button>
          <div id="incFreelanceInfo" style="display: none;"></div>

          <!-- ISA Incentive Info -->
          <div id="incFseInfo" style="display: flex; flex-direction: column; gap: 16px;">
            <h4 style="color: #fff; margin: 0; font-size: 15px;">Incentive Plan (Applicable in a calendar month)</h4>
            
            <!-- Table 1: Achievement & Fixed Component -->
            <div style="background: var(--bg); border: 1px solid var(--line); border-radius: 10px; overflow-x: auto; font-size: 13px;">
              <table style="width: 100%; border-collapse: collapse; text-align: left;">
                <thead>
                  <tr style="background: rgba(255,255,255,0.04); border-bottom: 1px solid var(--line); color: #fff; font-weight: 700;">
                    <th style="padding: 10px 12px;">Achievement</th>
                    <th style="padding: 10px 12px; color: var(--green);">Fixed Component</th>
                    <th style="padding: 10px 12px; color: var(--amber);">Additional Incentive</th>
                  </tr>
                </thead>
                <tbody style="color: #d1d5db;">
                  <tr style="border-bottom: 1px solid var(--line); background: rgba(16, 185, 129, 0.04);">
                    <td style="padding: 10px 12px; font-weight: 700; color: #fff;">On 4 sale ( min 1 POS per week)</td>
                    <td style="padding: 10px 12px; font-weight: 800; color: var(--green);">Rs 15,300/-</td>
                    <td style="padding: 10px 12px; color: #64748b;">-</td>
                  </tr>
                  <tr style="border-bottom: 1px solid var(--line);">
                    <td style="padding: 10px 12px; font-weight: 700; color: #fff;">On 5th Sale</td>
                    <td style="padding: 10px 12px; color: #64748b;">-</td>
                    <td style="padding: 10px 12px; font-weight: 800; color: var(--amber);">Rs 2,000/-</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 12px; font-weight: 700; color: #fff;">On 6th Sale Onwards</td>
                    <td style="padding: 10px 12px; color: #64748b;">-</td>
                    <td style="padding: 10px 12px; font-weight: 800; color: var(--amber);">Rs 1,000/- per POS</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Table 2: Total Compensation Table -->
            <h4 style="color: #fff; margin: 6px 0 0 0; font-size: 14px;">Total Compensation Schedule</h4>
            <div style="background: var(--bg); border: 1px solid var(--line); border-radius: 10px; overflow-x: auto; font-size: 12.5px; max-height: 220px; overflow-y: auto;">
              <table style="width: 100%; border-collapse: collapse; text-align: left;">
                <thead>
                  <tr style="background: rgba(255,255,255,0.04); border-bottom: 1px solid var(--line); color: #fff; font-weight: 700;">
                    <th style="padding: 8px 12px;">Count of POS Sale in a month</th>
                    <th style="padding: 8px 12px; color: var(--green);">Total Compensation</th>
                  </tr>
                </thead>
                <tbody style="color: #94a3b8;">
                  <tr style="border-bottom: 1px solid var(--line);"><td style="padding: 6px 12px;">1</td><td style="padding: 6px 12px; color: #64748b;">Target Not Met</td></tr>
                  <tr style="border-bottom: 1px solid var(--line);"><td style="padding: 6px 12px;">2</td><td style="padding: 6px 12px; color: #64748b;">Target Not Met</td></tr>
                  <tr style="border-bottom: 1px solid var(--line);"><td style="padding: 6px 12px;">3</td><td style="padding: 6px 12px; color: #64748b;">Target Not Met</td></tr>
                  <tr style="border-bottom: 1px solid var(--line); background: rgba(16, 185, 129, 0.05);"><td style="padding: 6px 12px; font-weight: 700; color: #fff;">4</td><td style="padding: 6px 12px; font-weight: 800; color: var(--green);">₹15,300</td></tr>
                  <tr style="border-bottom: 1px solid var(--line);"><td style="padding: 6px 12px; font-weight: 700; color: #fff;">5</td><td style="padding: 6px 12px; font-weight: 800; color: var(--green);">₹17,300</td></tr>
                  <tr style="border-bottom: 1px solid var(--line);"><td style="padding: 6px 12px; font-weight: 700; color: #fff;">6</td><td style="padding: 6px 12px; font-weight: 800; color: var(--green);">₹18,300</td></tr>
                  <tr style="border-bottom: 1px solid var(--line);"><td style="padding: 6px 12px; font-weight: 700; color: #fff;">7</td><td style="padding: 6px 12px; font-weight: 800; color: var(--green);">₹19,300</td></tr>
                  <tr style="border-bottom: 1px solid var(--line);"><td style="padding: 6px 12px; font-weight: 700; color: #fff;">8</td><td style="padding: 6px 12px; font-weight: 800; color: var(--green);">₹20,300</td></tr>
                  <tr style="border-bottom: 1px solid var(--line);"><td style="padding: 6px 12px; font-weight: 700; color: #fff;">9</td><td style="padding: 6px 12px; font-weight: 800; color: var(--green);">₹21,300</td></tr>
                  <tr style="border-bottom: 1px solid var(--line);"><td style="padding: 6px 12px; font-weight: 700; color: #fff;">10</td><td style="padding: 6px 12px; font-weight: 800; color: var(--green);">₹22,300</td></tr>
                  <tr style="border-bottom: 1px solid var(--line);"><td style="padding: 6px 12px; font-weight: 700; color: #fff;">11</td><td style="padding: 6px 12px; font-weight: 800; color: var(--green);">₹23,300</td></tr>
                  <tr style="border-bottom: 1px solid var(--line);"><td style="padding: 6px 12px; font-weight: 700; color: #fff;">12</td><td style="padding: 6px 12px; font-weight: 800; color: var(--green);">₹24,300</td></tr>
                  <tr><td style="padding: 6px 12px; font-weight: 700; color: #fff;">13</td><td style="padding: 6px 12px; font-weight: 800; color: var(--green);">₹25,300</td></tr>
                </tbody>
              </table>
            </div>

            <!-- Quiz Question -->
            <div id="incFseQuizBox" style="display: flex; flex-direction: column; gap: 10px; border-top: 1px solid var(--line); padding-top: 12px;">
              <h3 style="font-family: 'Archivo'; color: #fff; margin: 0; font-size: 14.5px;">✏️ Incentive Question:</h3>
              <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--line); border-radius: 8px; padding: 12px; display: flex; flex-direction: column; gap: 6px; font-size: 13px;">
                <div><b style="color: var(--amber);">Question:</b> I have done 5 sales as ISA (Field Executive). My monthly takeaway would be?</div>
              </div>
              <div style="display: flex; flex-direction: column; gap: 8px;" class="quiz-options" id="incFseOptions">
                <button class="part-btn" data-ans="15300" style="text-align: left; padding: 8px 12px; font-size: 12.5px; width: 100%;">15,300</button>
                <button class="part-btn" data-ans="500" style="text-align: left; padding: 8px 12px; font-size: 12.5px; width: 100%;">17,300 (15,300 fixed retainer + 2,000 for 5th sale)</button>
                <button class="part-btn" data-ans="16300" style="text-align: left; padding: 8px 12px; font-size: 12.5px; width: 100%;">16,300</button>
                <button class="part-btn" data-ans="10300" style="text-align: left; padding: 8px 12px; font-size: 12.5px; width: 100%;">10,300</button>
              </div>
              <div id="incFseFeedback" style="font-size: 13px; font-weight: 600; min-height: 20px;"></div>
            </div>
          </div>

          <button class="done-btn" id="attendanceFinishBtn" disabled style="margin-top: 10px; width: 100%;">Complete &amp; Get Certificate</button>
        </div>'''

if old_inc_block in html:
    html = html.replace(old_inc_block, new_inc_block)
    print("Updated Phase 6 Incentive Policy HTML!")

with open('public/index.html', 'wb') as f:
    f.write(html.encode('utf-8'))

# 4. Update public/app.js to auto-display attFseInfo, empFseInfo, incFseInfo by default
with open('public/app.js', 'rb') as f:
    app_code = f.read().decode('utf-8', errors='replace')

old_app_att = '''  btnAttFreelance.onclick = () => {
    btnAttFreelance.classList.add("active");
    btnAttFse.classList.remove("active");
    attFreelanceInfo.style.display = "flex";
    attFseInfo.style.display = "none";
    employmentSelected = "Freelance";
    state.attendanceChoice = "Freelance";
    save();
    btnGoToEmployment.disabled = false;
    tabEmployment.removeAttribute("disabled");
  };'''

new_app_att = '''  // Auto-display ISA profile content for all 3 policies by default
  if ($("attFseInfo")) $("attFseInfo").style.display = "flex";
  if ($("empFseInfo")) $("empFseInfo").style.display = "flex";
  if ($("incFseInfo")) $("incFseInfo").style.display = "flex";
  employmentSelected = "FSE";
  state.attendanceChoice = "ISA (Field Executive)";
  state.employmentChoice = "ISA (Field Executive)";
  state.incentiveChoice = "ISA (Field Executive)";
  save();

''' + old_app_att

if old_app_att in app_code and "Auto-display ISA profile content" not in app_code:
    app_code = app_code.replace(old_app_att, new_app_att)

# Fix readiness score % formatting bug in app.js
old_cert_line = "const readinessScore = cert.readinessScore || state.score || 87;"
new_cert_line = "const rawScore = cert.readinessScore !== undefined ? cert.readinessScore : (state.score || 85);\n    const readinessScore = typeof rawScore === 'string' ? parseInt(rawScore.replace(/%/g, ''), 10) || 85 : Math.round(rawScore);"

if old_cert_line in app_code:
    app_code = app_code.replace(old_cert_line, new_cert_line)

with open('public/app.js', 'wb') as f:
    f.write(app_code.encode('utf-8'))

print("All 3 policies updated to ISA (Field Executive) cleanly!")
