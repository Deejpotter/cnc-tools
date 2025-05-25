<main id="app-content" class="app-content" role="main">
    <div class="container">
        <div class="row">
            <div class="col text-center m-3">
                <img class="w-100" src="https://www.layerfused.com/themes/prismify-bootstrap-starter-kit/assets/images/stock/Calipers-cropped.png" alt="3D Printer Calibration" />
            </div>
        </div>

        <div class="row my-3">
            <div class="col">
                <h2>Calibration Overview</h2>
                <p>
                    3D Printer calibration is critical to 3D printing accuracy. These calculators and resources will allow you to calibrate your printer for optimal results.
                </p>
            </div>
        </div>

        <div class="row mt-3">
            <div class="col-sm-12">
                <h2><i class="fa fa-cog" aria-hidden="true"></i> Steps per milimeter</h2>
                <p>
                    The steps per millimeter (steps/mm) calculation is used to calibrate the X, Y, Z and E axis of your 3D printer. This same calculation is used regardless of the axis. The process is to have a known target you are trying to reach and then measure the actual value. The calculator will then adjust your steps/mm based on the measured value to provide a new value which will match the target value.
                </p>
            </div>
        </div>

        <div class="row align-items-center py-2">
            <div class="col-lg-3 col-md-3 col-6 font-weight-bold  text-sm-right">
                <label class="align-text-middle mb-0" for="spm_old">Current Steps/mm</label>
            </div>
            <div class="col-lg-1 col-md-2 col-6 my-1">
                <input type="text" class="form-control" id="spm_old" onkeyup="spmCalc()">
            </div>
            <div class="col-lg-8 col-md-7 col-12 my-1">
                <code>M503</code> G-Code will reveal the <code>M92</code> values. Use your existing X/Y/Z/E value for this field.
            </div>
        </div>
        <div class="row align-items-center py-2">
            <div class="col-lg-3 col-md-3 col-6 font-weight-bold text-sm-right">
                <label class="align-text-middle mb-0" for="spm_target">Target Value</label>
            </div>
            <div class="col-lg-1 col-md-2 col-6 my-1">
                <input type="text" class="form-control" id="spm_target" value="100" onkeyup="spmCalc()" />
            </div>
            <div class="col-lg-8 col-md-7 col-12 my-1">
                The expected amount of axis movement. For example, enter 100 if you move the axis 100mm.
            </div>
        </div>
        <div class="row align-items-center py-2">
            <div class="col-lg-3 col-md-3 col-6 font-weight-bold text-sm-right">
                <label class="align-text-middle mb-0" for="spm_measured">Measured Value</label>
            </div>
            <div class="col-lg-1 col-md-2 col-6 my-1">
                <input type="text" class="form-control" id="spm_measured" onkeyup="spmCalc()" />
            </div>
            <div class="col-lg-8 col-md-7 col-12 my-1">
                The actual amount of axis movement. Use of calipers is recommended, but a metric ruler can be used.
            </div>
        </div>
        <div class="row align-items-center py-2 bg-light border-top border-bottom">
            <div class="col-lg-3 col-md-3 col-6 font-weight-bold text-sm-right">
                <label class="align-text-middle mb-0" for="spm_new">New Steps/mm Value</label>
            </div>
            <div class="col-lg-1 col-md-2 col-6 my-1">
                <input type="text" class="form-control bg-white font-weight-bold" id="spm_new" value="" readonly="readonly" />
            </div>
            <div class="col-lg-8 col-md-7 col-12 my-1">
                Enter this value, up to 2 decimal places, into Marlin for the axis you are calibrating. For example <code>M92 X80.40</code> for the X axis. Be sure to then save your configuration in Marlin with <code>M500</code>.
            </div>
        </div>

        <div class="row my-3 mt-5">
            <div class="col-sm-12">
                <h2><i class="fa fa-tint" aria-hidden="true"></i> Flow Compensation</h2>
                <p>
                    Flow compensation is used to compensate for the expansion of the filament being pressed against the layer underneath. Use this calculator correct for the expansion of the filament by adjusting the flow rate.
                    To use this calculator print a 20mm x 20mm x 20mm cube in vase mode and then measure the top 5 layers with your caliper. Measure near the center of the cube not near the edges. Enter the values below to see
                    how you can adjust your flow compensation to produce the properly sized line width of extruded material. <br />
                    <span class="font-weight-bold">Note that flow compensation can differ based on material.</span>
                </p>
            </div>
        </div>

        <div class="row align-items-center py-2">
            <div class="col-lg-3 col-md-3 col-6 font-weight-bold text-sm-right">
                <label class="align-text-middle mb-0" for="flow_old">Current Flow %</label>
            </div>
            <div class="col-lg-1 col-md-2 col-6 my-1">
                <input type="text" class="form-control" id="flow_old" value="100" onkeyup="flowCalc()">
            </div>
            <div class="col-lg-8 col-md-7 col-12 my-1">
                Most slicers have flow compensation set to 100% by default.
            </div>
        </div>
        <div class="row align-items-center py-2">
            <div class="col-lg-3 col-md-3 col-6 font-weight-bold text-sm-right">
                <label class="align-text-middle mb-0" for="flow_nozzle">Nozzle Width</label>
            </div>
            <div class="col-lg-1 col-md-2 col-6 my-1">
                <input type="text" class="form-control" id="flow_nozzle" value=".4" onkeyup="flowCalc()">
            </div>
            <div class="col-lg-8 col-md-7 col-12 my-1">
                Enter the diameter of your nozzle.
            </div>
        </div>
        <div class="row align-items-center py-2">
            <div class="col-lg-3 col-md-3 col-6 font-weight-bold text-sm-right">
                <legend class="align-text-middle mb-0">Measured Values</label>
            </div>
            <div class="col-12 col-md-2 col-lg-1 no-gutters my-1">
                <fieldset class="col-12">
                    <div class="row">
                        <div class="col-3 col-md-12 my-md-1">
                            <label for="flow_c1" class="sr-only">Wall 1</label>
                            <input type="text" class="form-control" id="flow_c1" onkeyup="flowCalc()">
                        </div>
                        <div class="col-3 col-md-12 my-md-1">
                            <label for="flow_c2" class="sr-only">Wall 2</label>
                            <input type="text" class="form-control" id="flow_c2" onkeyup="flowCalc()">
                        </div>
                        <div class="col-3 col-md-12 my-md-1">
                            <label for="flow_c3" class="sr-only">Wall 3</label>
                            <input type="text" class="form-control" id="flow_c3" onkeyup="flowCalc()">
                        </div>
                        <div class="col-3 col-md-12 my-md-1">
                            <label for="flow_c4" class="sr-only">Wall 4</label>
                            <input type="text" class="form-control" id="flow_c4" onkeyup="flowCalc()">
                        </div>
                    </div>
                </fieldset>
            </div>
            <div class="col-lg-8 col-md-7 col-12 my-1">
                Measure the thickness of each side of the cube wall using the top 5 layers near the center of the wall.
            </div>
        </div>
        <div class="row align-items-center py-2 bg-light border-top border-bottom">
            <div class="col-lg-3 col-md-3 col-6 font-weight-bold text-sm-right">
                <label class="align-text-middle mb-0" for="flow_new" :>New Flow %</label>
            </div>
            <div class="col-lg-1 col-md-2 col-6 my-1">
                <input type="text" class="form-control bg-white font-weight-bold" id="flow_new" value="" readonly="readonly">
            </div>
            <div class="col-lg-8 col-md-7 col-12 my-1">
                Enter this value into one or more fields of Cura's flow compensation fields. Shell/Skin values are most important to modify for accurate parts.
            </div>
        </div>
        <div class="row my-3 mt-5">
            <div class="col-sm-12">
                <h2><i class="fa fa-align-left" aria-hidden="true"></i> Startup GCode Generator</h2>
                <p>
                    The startup code generator creates startup GCode for your 3D Printer. Simply copy and paste the output into your slicers startup gcode settings and you're done.<br />
                    You can enable a number of features including Bed Leveling, Nozzle Purge and Wipe, Sound Alerts and more. <br />
                    <span class="font-weight-bold"></span>
                </p>
            </div>
        </div>
        <h5>Printer</h5>
        <div class="row align-items-center py-2 border border-primary rounded">

            <div class="col-lg-3 col-md-3 col-6 font-weight-bold   text-sm-right">
                <label class="align-text-middle mb-0" for="sgg_x_size">Bed Size X</label>
            </div>
            <div class="col-lg-1 col-md-2 col-6 my-1">
                <input type="text" class="form-control" id="sgg_x_size" onkeyup="sggCalc()" value="300">
            </div>
            <div class="col-lg-8 col-md-7 col-12 my-1">
                The X size of your 3D Printer Bed in mm
            </div>
            <div class="col-lg-3 col-md-3 col-6 font-weight-bold  text-sm-right">
                <label class="align-text-middle mb-0" for="sgg_y_size">Bed Size Y</label>
            </div>
            <div class="col-lg-1 col-md-2 col-6 my-1">
                <input type="text" class="form-control" id="sgg_y_size" onkeyup="sggCalc()" value="300">
            </div>
            <div class="col-lg-8 col-md-7 col-12 my-1">
                The Y size of your 3D Printer Bed in mm
            </div>
        </div>
        <br />
        <h5>Options</h5>
        <div class="row align-items-center py-2 border border-primary rounded">

            <div class="col-lg-3 col-md-3 col-6 font-weight-bold   text-sm-right">
                <label class="align-text-middle mb-0" for="sgg_opt_g34">Add Z Auto-Align</label>
            </div>
            <div class="col-lg-1 col-md-2 col-6 my-1">
                <input type="Checkbox" class="form-control" id="sgg_opt_g34" onchange="sggCalc()">
            </div>
            <div class="col-lg-8 col-md-7 col-12 my-1">
                Execute a G34 and align the Z axis before homing the printer.
            </div>

            <div class="col-lg-3 col-md-3 col-6 font-weight-bold   text-sm-right">
                <label class="align-text-middle mb-0" for="sgg_opt_home">Home Before Printing</label>
            </div>
            <div class="col-lg-1 col-md-2 col-6 my-1">
                <input type="Checkbox" class="form-control" id="sgg_opt_home" onchange="sggCalc()" checked="checked">
            </div>
            <div class="col-lg-8 col-md-7 col-12 my-1">
                Execute a G28 and home the printer before printing. (required for most printers)
            </div>



            <div class="col-lg-3 col-md-3 col-6 font-weight-bold   text-sm-right">
                <label class="align-text-middle mb-0" for="sgg_opt_bedleveling">Enable Bed Levling</label>
            </div>
            <div class="col-lg-1 col-md-2 col-6 my-1">
                <input type="Checkbox" class="form-control" id="sgg_opt_bedleveling" onchange="sggCalc()">
            </div>
            <div class="col-lg-8 col-md-7 col-12 my-1">
                G29 - Adds bed levling, Loads from Mesh 0, Performs mesh tilt before printing to level plane.
            </div>

            <div class="col-lg-3 col-md-3 col-6 font-weight-bold   text-sm-right">
                <label class="align-text-middle mb-0" for="sgg_opt_kiss">Enable KISS Purge</label>
            </div>
            <div class="col-lg-1 col-md-2 col-6 my-1">
                <input type="Checkbox" class="form-control" id="sgg_opt_kiss" onchange="sggCalc()">
            </div>
            <div class="col-lg-8 col-md-7 col-12 my-1">
                Uses landing strip on your print bed to purge and prime nozzle, wipe tip right before printing.
                This feature requires a small space on your print bed to have a piece of painters tape on the front of your bed, called a landing strip, for the purge and wipe.<br />
                This feature allows you to turn off things like a "Skirt" or purge line that takes up more space on your bed. <br /><br />
                Landing Strip Size 15mm X 40mm. <br />
                <span class="font-weight-bold">This feature only works on a rectangular print bed. </span>
                <br /> [See this in action]
            </div>
            <div class="row align-items-center py-2" id="kiss_opts" style="display: none">
                <div class="col-lg-5 col-md-3 col-6 font-weight-bold   text-sm-right">
                    <label class="align-text-middle mb-0" for="sgg_strip_x">Strip X Position</label>
                </div>
                <div class="col-lg-1 col-md-2 col-6 my-1">
                    <input type="text" class="form-control" id="sgg_strip_x" onchange="sggCalc()" value="200">
                </div>
                <div class="col-lg-5 col-md-7 col-12 my-1">
                    The X position for the landing strip.
                </div>

                <div class="col-lg-5 col-md-3 col-6 font-weight-bold   text-sm-right">
                    <label class="align-text-middle mb-0" for="sgg_strip_y">Strip Y Position</label>
                </div>
                <div class="col-lg-1 col-md-2 col-6 my-1">
                    <input type="text" class="form-control" id="sgg_strip_y" onchange="sggCalc()" value="0">
                </div>
                <div class="col-lg-5 col-md-7 col-12 my-1">
                    The Y position for the landing strip.
                </div>

                <div class="col-lg-5 col-md-3 col-6 font-weight-bold   text-sm-right">
                    <label class="align-text-middle mb-0" for="sgg_strip_retraction">Retraction After Purge</label>
                </div>
                <div class="col-lg-1 col-md-2 col-6 my-1">
                    <input type="text" class="form-control" id="sgg_strip_retraction" onchange="sggCalc()" value=".7">
                </div>
                <div class="col-lg-5 col-md-7 col-12 my-1">
                    The amount of retraction after the KISS purge. .7mm is a good amount for direct drive and 4-8mm is a good amount for bowden setups.
                </div>

                <div class="col-lg-5 col-md-3 col-6 font-weight-bold   text-sm-right">
                    <label class="align-text-middle mb-0" for="sgg_strip_distance">Distance From Bed</label>
                </div>
                <div class="col-lg-1 col-md-2 col-6 my-1">
                    <input type="text" class="form-control" id="sgg_strip_distance" onchange="sggCalc()" value=".1">
                </div>
                <div class="col-lg-5 col-md-7 col-12 my-1">
                    The distance from the nozzle to the bed at Z=0. For most 3D Printer users this will be .1mm and work without issue. Increase this value only if your wipe is not touching the tape.
                </div>


            </div>

            <div class="col-lg-3 col-md-3 col-6 font-weight-bold   text-sm-right">
                <label class="align-text-middle mb-0" for="sgg_opt_audio_feedback">Enable Audio Feedback</label>
            </div>
            <div class="col-lg-1 col-md-2 col-6 my-1">
                <input type="Checkbox" class="form-control" id="sgg_opt_audio_feedback" onchange="sggCalc()">
            </div>
            <div class="col-lg-8 col-md-7 col-12 my-1">
                Adds M300 Audio feedback and a CHARGE! Fanfare when printing begins.
            </div>

        </div>
        <br />
        <h5>Output</h5>
        <div class="row align-items-center py-2 border border-primary rounded">

            <div class="col-lg-3 col-md-3 col-6 font-weight-bold   text-sm-right">
                <label class="align-text-middle mb-0" for="sgg_code">Startup Code</label>
            </div>
            <div class="col-lg-8 col-md-2 col-6 my-1">
                <textarea class="form-control" id="sgg_code" onkeyup="sggCalc()" value="300" rows="5" onfocus="sggCalc();"></textarea>
            </div>
        </div>

        <!-- Modal -->
        <div class="modal fade" id="errorModal" tabindex="-1" role="dialog" aria-labelledby="errorModalLabel" aria-hidden="true">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="errorModalLabel">Error Generating GCode</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body" id="errorMessage">

                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        // Script Templates
        let chirp = `; sound chirp (Optional)
M300 P75  S1750
M300 P250  S0
M300 P75  S1750
M300 P75  S0
; End Sound chirp
`;

        let g34 = `G34           ; Align Z Steppers
`;

        let abl = `G29 A1	      ; Activate UBL 
G29 L0        ; Load the mesh stored in slot 0 (from G29 S0)
G29 J         ; No size specified on the J option tells G29 to probe the specified 3 points and tilt the mesh according to what it finds. level plane.
`;

        function header() {
            const timeElapsed = Date.now();
            const today = new Date(timeElapsed);
            var timestamp = today.toDateString();
            // Home Template
            let header = `; Startup GCode Generator\n; Generated at ${timestamp} by https://www.makerstore.com.au\n`;
            return header;
        }
        let footer = `;
            Footer - Reset extruder and go to absolute extrusion mode
            G92 E0;
            Reset Extruder
            G90;
            Reset Absolute Positioning
            G0 Z4 F400;
            Move down just a bit
                `;
        let homeTemplate = `
            G90;
            Set absolute positioning mode
            G28;
            Home the printer
                `;

        function kissGenerator(sgg_strip_x, sgg_strip_y, sgg_strip_retraction, sgg_strip_distance, sgg_x_size, sgg_y_size) {
            let kiss = `;
            Kiss Generation
            M211 S0;
            Software Endstops off
            G0 X$ {
                sgg_strip_x + 40
            }
            Y$ {
                sgg_strip_y
            }
            Z5 F5000;
            Move to position
            G92 E0;
            Reset Extruder
            G1 E80 F300;
            Extrude a kiss
            G0 X$ {
                sgg_strip_x + 5
            }
            Y$ {
                sgg_strip_y
            }
            Z0 F1000;
            Wipe
            G0 X$ {
                sgg_strip_x + 15
            }
            Y$ {
                sgg_strip_y
            }
            Z0 F1000;
            Wipe
            G0 X$ {
                sgg_strip_x + 5
            }
            Y$ {
                sgg_strip_y + 5
            }
            Z - $ {
                sgg_strip_distance
            }
            F700;
            Wipe
            G0 X$ {
                sgg_strip_x + 15
            }
            Y$ {
                sgg_strip_y + 5
            }
            Z - $ {
                sgg_strip_distance
            }
            F700;
            Wipe
            G0 X$ {
                sgg_strip_x + 5
            }
            Y$ {
                sgg_strip_y + 10
            }
            Z0 F1000;
            Wipe
            G0 X$ {
                sgg_strip_x + 5
            }
            Y$ {
                sgg_strip_y + 10
            }
            Z0 F1000;
            Wipe
            G0 Z2 E - $ {
                sgg_strip_retraction
            }
            F300
            M211 S1;
            Re enable software endstops
            G0 X$ {
                sgg_x_size / 2
            }
            Y$ {
                sgg_x_size / 2
            }
            Z4 F5000;
            Return to center of bed `;
            return kiss;
        }

        // Charge Audio template
        let charge = `;
            Charge!
                M300 P250 S392
            M300 P83 S392
            M300 P250 S392
            M300 P83 S392
            M300 P250 S392
            M300 P83 S392
            M300 P250 S392
            M300 P83 S392
            M300 P250 S392
            M300 P83 S392
            M300 P250 S392
            M300 P83 S392
            M300 P167 S587
            M300 P167 S494
            M300 P167 S587
            M300 P167 S494
            M300 P167 S587
            M300 P167 S494
            M300 P250 S392
            M300 P83 S392
            M300 P250 S392
            M300 P83 S392
            M300 P250 S392
            M300 P83 S392
            M300 P250 S392
            M300 P83 S392
            M300 P250 S392
            M300 P83 S392
            M300 P250 S392
            M300 P83 S392
            M300 P167 S587
            M300 P167 S494
            M300 P167 S587
            M300 P167 S494
            M300 P167 S587
            M300 P167 S494
            M300 P1000 S392
                `;
        // Steps per mm calcualtor
        function spmCalc() {
            if ($.isNumeric($('#spm_old').val()) && $.isNumeric($('#spm_target').val()) && $.isNumeric($('#spm_measured').val())) {
                $('#spm_new').val(parseFloat($('#spm_old').val()) * (parseFloat($('#spm_target').val()) / parseFloat($('#spm_measured').val())));
            } else {
                $('#spm_new').val('');
            }
        }

        // Flow Compensation calcuator.
        function flowCalc() {
            if ($.isNumeric($('#flow_old').val()) && $.isNumeric($('#flow_nozzle').val()) && $.isNumeric($('#flow_c1').val()) && $.isNumeric($('#flow_c2').val()) && $.isNumeric($('#flow_c3').val()) && $.isNumeric($('#flow_c4').val())) {
                var avgThickness = (parseFloat($('#flow_c1').val()) + parseFloat($('#flow_c2').val()) + parseFloat($('#flow_c3').val()) + parseFloat($('#flow_c4').val())) / 4;
                var newFlow = parseFloat($('#flow_old').val()) * (parseFloat($('#flow_nozzle').val()) / avgThickness);
                $('#flow_new').val(newFlow);
            } else {
                $('#flow_new').val('');
            }

        }

        function generateHtml(sgg_opt_home, sgg_opt_g34, sgg_opt_audio_feedback, sgg_opt_bedleveling, sgg_opt_kiss, sgg_strip_x, sgg_strip_y, sgg_strip_retraction, sgg_strip_distance, sgg_x_size, sgg_y_size) {
            var output = header();
            // Command Chirp
            if (sgg_opt_audio_feedback == true) {
                output += chirp;
            }
            // Home   
            if (sgg_opt_home == true) {
                output += homeTemplate;
            }

            // Align Z Axis
            if (sgg_opt_g34 == true) {
                // Command Chirp
                if (sgg_opt_audio_feedback == true) {
                    output += chirp;
                }
                output += g34;
            }

            // Align Z Axis
            if (sgg_opt_bedleveling == true) {
                // Command Chirp
                if (sgg_opt_audio_feedback == true) {
                    output += chirp;
                }
                output += abl;
            }


            // Kiss Generation
            if (sgg_opt_kiss == true) {
                console.log("kiss opt");
                // Command Chirp
                if (sgg_opt_audio_feedback == true) {
                    output += chirp;
                }
                output += kissGenerator(sgg_strip_x, sgg_strip_y, sgg_strip_retraction, sgg_strip_distance, sgg_x_size, sgg_y_size);
            }




            // Add charge!
            // Command Chirp
            if (sgg_opt_audio_feedback == true) {
                output += charge;
            }

            output += footer;

            // Generate Output
            $('#sgg_code').val(output);
        }

        // Steps per mm calcualtor
        function sggCalc() {
            // Bed Size
            var sgg_x_size = $.isNumeric($('#sgg_x_size').val()) ? parseFloat($('#sgg_x_size').val()) : 0;
            var sgg_y_size = $.isNumeric($('#sgg_y_size').val()) ? parseFloat($('#sgg_y_size').val()) : 0;

            // Options
            var sgg_opt_home = $('#sgg_opt_home').is(':checked') ? true : false;
            var sgg_opt_bedleveling = $('#sgg_opt_bedleveling').is(':checked') ? true : false;
            var sgg_opt_g34 = $('#sgg_opt_g34').is(':checked') ? true : false;
            var sgg_opt_audio_feedback = $('#sgg_opt_audio_feedback').is(':checked') ? true : false;

            // Landing Strip - KISS Option and values
            var sgg_opt_kiss = $('#sgg_opt_kiss').is(':checked') ? true : false;
            var sgg_strip_x = $.isNumeric($('#sgg_strip_x').val()) ? parseFloat($('#sgg_strip_x').val()) : 0;
            var sgg_strip_y = $.isNumeric($('#sgg_strip_y').val()) ? parseFloat($('#sgg_strip_y').val()) : 0;
            var sgg_strip_retraction = $.isNumeric($('#sgg_strip_retraction').val()) ? parseFloat($('#sgg_strip_retraction').val()) : 0;
            var sgg_strip_distance = $.isNumeric($('#sgg_strip_distance').val()) ? parseFloat($('#sgg_strip_distance').val()) : 0;



            if ($('#sgg_opt_kiss').is(':checked')) {
                $('#kiss_opts').show();
            } else {
                $('#kiss_opts').hide();
            }


            // Field Validations 40mm from right
            if (sgg_opt_kiss == true && sgg_strip_x > (sgg_x_size - 40)) {
                $('#errorMessage').html('You have placed the landing strip too close to the end of the bed. It must be at least 40mm from the right edge.');
                $('#errorModal').modal('show');
                return;
            }
            // Field Validations 15mm from back
            if (sgg_opt_kiss == true && sgg_strip_y > (sgg_y_size - 15)) {
                $('#errorMessage').html('You have placed the landing strip too close to the end of the bed. It must be at least 15mm from the back.');
                $('#errorModal').modal('show');
                return;
            }

            // Validate Bed Distance
            if (sgg_strip_distance > .3) {
                $('#errorMessage').html('You have specified a very large distance between your nozzle and your print bed.' +
                    '  This value is typically very small and only the thickness of .1 .  <br />While your code will generate below using large values it can damage your nozzle or print bed if this value is set too high.  <br /><br />Proceed at your own risk.');
                $('#errorModal').modal('show');
            }

            generateHtml(sgg_opt_home, sgg_opt_g34, sgg_opt_audio_feedback, sgg_opt_bedleveling, sgg_opt_kiss, sgg_strip_x, sgg_strip_y, sgg_strip_retraction, sgg_strip_distance, sgg_x_size, sgg_y_size);

        }
    </script>
</main>