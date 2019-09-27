var makerjs = require('makerjs') as typeof makerjs;

class App {

    public fontList: google.fonts.WebfontList;
    private selectFamily: HTMLSelectElement;
    private selectVariant: HTMLSelectElement;
    private unionCheckbox: HTMLInputElement;
    private separateCheckbox: HTMLInputElement;
    private textInput: HTMLInputElement;
    private bezierAccuracy: HTMLInputElement;
    private sizeInput: HTMLInputElement;
    private arcRadiusInput: HTMLInputElement;
    private arcStartAngleInput: HTMLInputElement;
    private arcEndAngleInput: HTMLInputElement;
    private renderDiv: HTMLDivElement;
    private outputTextarea: HTMLTextAreaElement;

    private renderCurrent = () => {
        var size = this.sizeInput.valueAsNumber;
        if (!size) size = parseFloat(this.sizeInput.value);
        if (!size) size = 100;

        var arcRadius = this.arcRadiusInput.valueAsNumber;
        if (!arcRadius) arcRadius = parseFloat(this.arcRadiusInput.value);
        if (!arcRadius) size = 100;

        var arcStartAngle = this.arcStartAngleInput.valueAsNumber;
        if (!arcStartAngle) arcStartAngle = parseFloat(this.arcStartAngleInput.value);
        if (!arcStartAngle) size = 45;

        var arcEndAngle = this.arcEndAngleInput.valueAsNumber;
        if (!arcEndAngle) arcEndAngle = parseFloat(this.arcEndAngleInput.value);
        if (!arcEndAngle) size = 135;

        this.render(this.selectFamily.selectedIndex, this.selectVariant.selectedIndex, this.textInput.value, size, this.unionCheckbox.checked, this.separateCheckbox.checked, parseFloat(this.bezierAccuracy.value) || undefined, arcRadius, arcStartAngle, arcEndAngle);
    };

    private loadVariants = () => {
        this.selectVariant.options.length = 0;
        var f = this.fontList.items[this.selectFamily.selectedIndex];
        var v = f.variants.forEach(v => this.addOption(this.selectVariant, v));
        this.renderCurrent();
    };

    constructor() {

    }

    init() {
        this.selectFamily = this.$('#font-select') as HTMLSelectElement;
        this.selectVariant = this.$('#font-variant') as HTMLSelectElement;
        this.unionCheckbox = this.$('#input-union') as HTMLInputElement;
        this.separateCheckbox = this.$('#input-separate') as HTMLInputElement;
        this.textInput = this.$('#input-text') as HTMLInputElement;
        this.bezierAccuracy = this.$('#input-bezier-accuracy') as HTMLInputElement;
        this.sizeInput = this.$('#input-size') as HTMLInputElement;
        this.arcRadiusInput = this.$('#input-arc-radius') as HTMLInputElement;
        this.arcStartAngleInput = this.$('#input-arc-start-angle') as HTMLInputElement;
        this.arcEndAngleInput = this.$('#input-arc-end-angle') as HTMLInputElement;
        this.renderDiv = this.$('#svg-render') as HTMLDivElement;
        this.outputTextarea = this.$('#output-svg') as HTMLTextAreaElement;
    }

    handleEvents() {
        this.selectFamily.onchange = this.loadVariants;
        this.selectVariant.onchange = this.textInput.onchange = this.textInput.onkeyup = this.sizeInput.onchange = this.unionCheckbox.onchange = this.separateCheckbox.onchange = this.bezierAccuracy.onchange = this.arcRadiusInput.onchange = this.arcStartAngleInput.onchange = this.arcEndAngleInput.onchange = this.renderCurrent;
    }

    $(selector: string) {
        return document.querySelector(selector);
    }

    addOption(select: HTMLSelectElement, optionText: string) {
        var option = document.createElement('option');
        option.text = optionText;
        select.options.add(option);
    }

    getGoogleFonts(apiKey: string) {
        var xhr = new XMLHttpRequest();
        xhr.open('get', 'https://www.googleapis.com/webfonts/v1/webfonts?key=' + apiKey, true);
        xhr.onloadend = () => {
            this.fontList = JSON.parse(xhr.responseText);
            this.fontList.items.forEach(font => this.addOption(this.selectFamily, font.family));
            this.loadVariants();
            this.handleEvents();
        };
        xhr.send();
    }

    render(fontIndex: number, variantIndex: number, text: string, size: number, union: boolean, separate: boolean, bezierAccuracy: number, arcRadius: number, arcStartAngle: number, arcEndAngle: number) {
        var f = this.fontList.items[fontIndex];
        var v = f.variants[variantIndex];
        var url = f.files[v].substring(5);  //remove http:

        opentype.load(url, (err, font) => {

            //generate the text using a font
            var textModel = new makerjs.models.Text(font, text, size, union, false, bezierAccuracy);

            var arc = new makerjs.paths.Arc([0, 0], arcRadius, arcStartAngle, arcEndAngle);
            makerjs.layout.childrenOnPath(textModel, arc, 0, true);

            if (separate) {
                for (var i in textModel.models) {
                    textModel.models[i].layer = i;
                }
            }

            var svg = makerjs.exporter.toSVG(textModel);

            this.renderDiv.innerHTML = svg;
            this.outputTextarea.value = svg;
        });

    }
}

var app = new App();

window.onload = () => {
    app.init();
    app.getGoogleFonts('AIzaSyAOES8EmKhuJEnsn9kS1XKBpxxp-TgN8Jc');
};
